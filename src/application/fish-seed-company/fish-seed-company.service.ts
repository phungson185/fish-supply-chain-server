import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { BaseQueryParams, BaseResult, PaginationDto } from 'src/domain/dtos';
import {
  BatchDocument,
  Batchs,
  FarmedFishDocument,
  FarmedFishs,
  FishFarmerDocument,
  FishFarmers,
  FishSeed,
  FishSeedDocument,
  Log,
  LogDocument,
  UserDocument,
  Users,
} from 'src/domain/schemas';
import { GetSystemConfig } from '../system/queries/get.systemconfig';
import {
  AddFishSeedDto,
  FarmedFishContractDto,
  QueryFishSeed,
  UpdateFarmedFishContractDto,
} from './dtos';
import { BatchDto } from './dtos/batch.dto';
import { TransactionType } from 'src/domain/enum/transactionType';
import {
  GeographicOrigin,
  LogType,
  MethodOfReproduction,
} from 'src/domain/enum';
import { compareObjects, noCompareKeys } from 'src/utils/utils';
import * as qrcode from 'qrcode';
import { AppConfiguration, InjectAppConfig } from 'src/config/configuration';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FishSeedCompanyService {
  constructor(
    @InjectModel(FarmedFishs.name)
    private readonly farmedFishModel: Model<FarmedFishDocument>,
    @InjectModel(Batchs.name)
    private readonly batchModel: Model<BatchDocument>,
    @InjectModel(FishSeed.name)
    private readonly fishSeedModel: Model<FishSeedDocument>,
    @InjectModel(FishFarmers.name)
    private readonly fishFarmerModel: Model<FishFarmerDocument>,
    @InjectModel(Log.name)
    private readonly logModel: Model<LogDocument>,
    @InjectModel(Users.name)
    private readonly userModel: Model<UserDocument>,
    @InjectAppConfig() private appConfig: AppConfiguration,
    private readonly queryBus: QueryBus,
  ) {}

  async createFarmedFishContract(farmedFishContractDto: FarmedFishContractDto) {
    const result = new BaseResult();
    const systemconfig = await this.queryBus.execute(new GetSystemConfig());
    if (!systemconfig) {
      throw new NotFoundException('System config not found');
    }

    const fishSeed = await this.fishSeedModel.findById(
      farmedFishContractDto.fishSeedId,
    );

    if (!fishSeed) {
      throw new NotFoundException('Fish seed not found');
    }

    fishSeed.quantity -= farmedFishContractDto.numberOfFishSeedsAvailable;

    if (fishSeed.quantity === 0) {
      fishSeed.isMakeContract = true;
    }
    await fishSeed.save();

    const { oldData, newData } = compareObjects({}, farmedFishContractDto);

    await this.logModel.create({
      objectId: farmedFishContractDto.farmedFishContract,
      owner: farmedFishContractDto.owner,
      transactionType: TransactionType.CONTRACT,
      logType: LogType.BLOCKCHAIN,
      message: `Deploy ${farmedFishContractDto.numberOfFishSeedsAvailable}kg fish seed with contract ${farmedFishContractDto.farmedFishContract}`,
      newData: newData,
      title: 'Deploy fish seed',
    });

    farmedFishContractDto.registrationContract =
      systemconfig.registrationContract;

    result.data = await this.farmedFishModel.create({
      ...farmedFishContractDto,
      fishSeedId: fishSeed._id,
      numberOfFishSeedsOrdered:
        farmedFishContractDto.numberOfFishSeedsAvailable,
    });

    return result;
  }

  async getFarmedFishContracts(queries: BaseQueryParams) {
    const result = new BaseResult();
    const { search, page, size, orderBy = 'updatedAt', desc = true } = queries;
    const skipIndex = size * (page - 1);
    const query: FilterQuery<FarmedFishDocument> = {};
    if (search) {
      query.$or = [
        {
          farmedFishContract: { $regex: search, $options: 'i' },
        },
        {
          speciesName: { $regex: search, $options: 'i' },
        },
      ];
    }

    let sorter = {};
    if (orderBy) {
      switch (orderBy) {
        case 'speciesName':
          sorter = desc
            ? { speciesName: 'desc', _id: 'desc' }
            : { speciesName: 'asc', _id: 'asc' };
          break;
        case 'geographicOrigin':
          sorter = desc
            ? { geographicOrigin: 'desc', _id: 'desc' }
            : { geographicOrigin: 'asc', _id: 'asc' };
          break;
        case 'numberOfFishSeedsAvailable':
          sorter = desc
            ? { numberOfFishSeedsAvailable: 'desc', _id: 'desc' }
            : { numberOfFishSeedsAvailable: 'asc', _id: 'asc' };
          break;
        case 'methodOfReproduction':
          sorter = desc
            ? { methodOfReproduction: 'desc', _id: 'desc' }
            : { methodOfReproduction: 'asc', _id: 'asc' };
          break;
        case 'waterTemperature':
          sorter = desc
            ? { waterTemperature: 'desc', _id: 'desc' }
            : { waterTemperature: 'asc', _id: 'asc' };
          break;
        case 'updatedAt':
          sorter = desc
            ? { updatedAt: 'desc', _id: 'desc' }
            : { updatedAt: 'asc', _id: 'asc' };
        default:
          sorter = desc
            ? { createdAt: 'desc', _id: 'desc' }
            : { createdAt: 'asc', _id: 'asc' };
          break;
      }
    }
    const items = await this.farmedFishModel
      .find(query)
      .populate('owner')
      .sort(sorter)
      .skip(skipIndex)
      .limit(size);
    const total = await this.farmedFishModel.countDocuments(query);

    result.data = new PaginationDto<FarmedFishs>(items, total, page, size);
    return result;
  }

  async getFarmedFishContract(id: string) {
    const result = new BaseResult();

    result.data = await this.farmedFishModel.findById(id).populate('owner');

    return result;
  }

  async updateFarmedFishContract(
    id: string,
    updateFarmedFishContractDto: UpdateFarmedFishContractDto,
  ) {
    const result = new BaseResult();

    const farmedFish = await this.farmedFishModel.findById(id);

    if (!farmedFish) {
      throw new NotFoundException('Farmed fish contract not found');
    }
    let isDifferent = false;
    Object.keys(updateFarmedFishContractDto).forEach((key) => {
      if (
        farmedFish[key] !== updateFarmedFishContractDto[key] &&
        !noCompareKeys.includes(key)
      ) {
        isDifferent = true;
      }
    });

    if (isDifferent) {
      const { oldData, newData } = compareObjects(
        farmedFish.toObject(),
        updateFarmedFishContractDto,
      );

      await this.logModel.create({
        objectId: farmedFish.farmedFishContract,
        transactionHash: updateFarmedFishContractDto.transactionHash,
        owner: farmedFish.owner,
        transactionType: TransactionType.CONTRACT,
        logType: LogType.BLOCKCHAIN,
        message: `Update farmed fish contract ${farmedFish.farmedFishContract}`,
        oldData,
        newData,
        title: 'Update farmed fish contract',
      });
    }

    result.data = await this.farmedFishModel.findByIdAndUpdate(id, {
      ...updateFarmedFishContractDto,
    });

    return result;
  }

  async createBatch(batchDto: BatchDto) {
    const result = new BaseResult();

    const batch = await this.batchModel.create({
      ...batchDto,
      lastChainPoint: 'farmedFishId',
    });

    let qrCodeString = await qrcode.toDataURL(
      `${this.appConfig.qrCodePrefixUrl}/${batch._id}`,
      {
        type: 'image/webp',
        margin: 1,
        width: 200,
      },
    );

    batch.qrCode = qrCodeString;
    await batch.save();

    result.data = batch;
    return result;
  }

  async addFishSeed(userId: string, addFishSeedDto: AddFishSeedDto) {
    const result = new BaseResult();

    result.data = await this.fishSeedModel.create({
      ...addFishSeedDto,
      owner: userId,
    });

    const { oldData, newData } = compareObjects({}, addFishSeedDto);

    if ((result.data as any)._id) {
      await this.logModel.create({
        objectId: (result.data as any)._id,
        transactionType: TransactionType.FISH_SEED,
        owner: userId,
        newData: newData,
        title: 'Add fish seed',
        message: `Add fish seed with name ${addFishSeedDto.speciesName}`,
      });
    }

    return result;
  }

  async getFishSeeds(queries: QueryFishSeed) {
    const result = new BaseResult();
    const { search, page, size, orderBy = 'updatedAt', desc = true } = queries;
    const skipIndex = size * (page - 1);
    const query: FilterQuery<FishSeedDocument> = {};
    if (search) {
      query.$or = [
        {
          speciesName: { $regex: search, $options: 'i' },
        },
      ];
    }

    let sorter = {};
    if (orderBy) {
      switch (orderBy) {
        case 'speciesName':
          sorter = desc
            ? { speciesName: 'desc', _id: 'desc' }
            : { speciesName: 'asc', _id: 'asc' };
          break;
        case 'geographicOrigin':
          sorter = desc
            ? { geographicOrigin: 'desc', _id: 'desc' }
            : { geographicOrigin: 'asc', _id: 'asc' };
          break;
        case 'methodOfReproduction':
          sorter = desc
            ? { methodOfReproduction: 'desc', _id: 'desc' }
            : { methodOfReproduction: 'asc', _id: 'asc' };
          break;
        case 'waterTemperature':
          sorter = desc
            ? { waterTemperature: 'desc', _id: 'desc' }
            : { waterTemperature: 'asc', _id: 'asc' };
          break;
        case 'quantity':
          sorter = desc
            ? { quantity: 'desc', _id: 'desc' }
            : { quantity: 'asc', _id: 'asc' };
          break;
        case 'updatedAt':
          sorter = desc
            ? { updatedAt: 'desc', _id: 'desc' }
            : { updatedAt: 'asc', _id: 'asc' };
        default:
          sorter = desc
            ? { createdAt: 'desc', _id: 'desc' }
            : { createdAt: 'asc', _id: 'asc' };
          break;
      }
    }
    const items = await this.fishSeedModel
      .find(query)
      .sort(sorter)
      .skip(skipIndex)
      .limit(size);
    const total = await this.fishSeedModel.countDocuments(query);

    result.data = new PaginationDto<FishSeed>(items, total, page, size);
    return result;
  }

  async getFishSeed(id: string) {
    const result = new BaseResult();
    const item = await this.fishSeedModel.findById(id);

    if (!item) {
      throw new NotFoundException('Fish seed not found');
    }

    result.data = item;
    return result;
  }

  async updateFishSeed(
    id: string,
    updateFishSeedDto: AddFishSeedDto,
    userId: string,
  ) {
    const result = new BaseResult();

    const item = await this.fishSeedModel.findById(id);
    if (!item) {
      throw new NotFoundException('Fish seed not found');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let isDifferent = false;

    Object.keys(updateFishSeedDto).forEach((key) => {
      if (
        item[key] !== updateFishSeedDto[key] &&
        !noCompareKeys.includes(key)
      ) {
        isDifferent = true;
      }
    });

    if (isDifferent) {
      const { oldData, newData } = compareObjects(
        item.toObject(),
        updateFishSeedDto,
      );

      await this.logModel.create({
        objectId: item.id,
        owner: userId,
        transactionType: TransactionType.FISH_SEED,
        logType: LogType.API,
        message: `Updated fish seed ${item.speciesName}`,
        oldData,
        newData,
        title: 'Update fish seed',
      });
    }

    result.data = await this.fishSeedModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updateFishSeedDto,
        },
      },
      {
        new: true,
        upsert: true,
      },
    );

    return result;
  }

  async summaryCommon(userId: string) {
    const result = new BaseResult();

    const totalFarmedFish = await this.farmedFishModel
      .find({
        owner: userId,
      })
      .countDocuments();

    const totalFishSeed = await this.fishSeedModel
      .find({
        owner: userId,
      })
      .countDocuments();
    const totalOrder = await this.fishFarmerModel
      .find({
        fishSeedsSeller: userId,
      })
      .countDocuments();

    const topFarmedFish = await this.farmedFishModel.aggregate([
      {
        $lookup: {
          from: 'fish-farmers', // Assuming the collection name for FishFarmers is 'fish-farmers'
          localField: '_id',
          foreignField: 'farmedFishId',
          as: 'orders',
        },
      },
      {
        $addFields: {
          orderCount: { $size: '$orders' },
        },
      },
      {
        $sort: { orderCount: -1 },
      },
      {
        $project: {
          _id: 0,
          speciesName: 1,
          orderCount: 1,
        },
      },
    ]);

    result.data = {
      totalFarmedFish,
      totalFishSeed,
      totalOrder,
      topFarmedFish,
    };

    return result;
  }

  async summaryMostOrder(
    userId: string,
    geographicOrigin: number,
    methodOfReproduction: number,
  ) {
    const result = new BaseResult();
    let filter = [
      {
        $lookup: {
          from: 'fish-seeds',
          localField: 'fishSeedId',
          foreignField: '_id',
          as: 'fishSeed',
        },
      },
      {
        $match: {
          owner: new Types.ObjectId(userId),
        },
      },
      { $unwind: '$fishSeed' },
    ] as PipelineStage[];

    if (Object.values(GeographicOrigin).includes(geographicOrigin)) {
      filter.push({
        $match: {
          'fishSeed.geographicOrigin': geographicOrigin,
        },
      });
    }

    if (Object.values(MethodOfReproduction).includes(methodOfReproduction)) {
      filter.push({
        $match: {
          'fishSeed.methodOfReproduction': methodOfReproduction,
        },
      });
    }

    filter = [
      ...filter,
      {
        $addFields: {
          quantity: '$fishSeed.quantity',
          numberOfFishSeedsOrdered: '$numberOfFishSeedsOrdered',
          speciesName: '$fishSeed.speciesName',
        },
      },
      {
        $group: {
          _id: '$fishSeed._id',
          quantity: { $first: '$quantity' },
          speciesName: { $first: '$fishSeed.speciesName' },
          numberOfFishSeedsOrdered: { $sum: '$numberOfFishSeedsOrdered' },
        },
      },
      {
        $sort: { quantity: -1 },
      },
      {
        $project: {
          _id: 0,
          quantity: 1,
          numberOfFishSeedsOrdered: 1,
          speciesName: 1,
        },
      },
    ];

    const topWithFilter = await this.farmedFishModel.aggregate(filter);
    result.data = topWithFilter;

    return result;
  }
}
