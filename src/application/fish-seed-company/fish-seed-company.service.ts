import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseQueryParams, BaseResult, PaginationDto } from 'src/domain/dtos';
import {
  BatchDocument,
  Batchs,
  FarmedFishDocument,
  FarmedFishs,
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
import { LogType } from 'src/domain/enum';
import { compareObjects } from 'src/utils/utils';

@Injectable()
export class FishSeedCompanyService {
  constructor(
    @InjectModel(FarmedFishs.name)
    private readonly farmedFishModel: Model<FarmedFishDocument>,
    @InjectModel(Batchs.name)
    private readonly batchModel: Model<BatchDocument>,
    @InjectModel(FishSeed.name)
    private readonly fishSeedModel: Model<FishSeedDocument>,
    @InjectModel(Log.name)
    private readonly logModel: Model<LogDocument>,
    @InjectModel(Users.name)
    private readonly userModel: Model<UserDocument>,
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
      transactionType: TransactionType.DEPLOY_CONTRACT,
      logType: LogType.BLOCKCHAIN,
      message: `Deploy ${farmedFishContractDto.numberOfFishSeedsAvailable}kg fish seed with contract ${farmedFishContractDto.farmedFishContract}`,
      oldData: oldData,
      newData: newData,
      title: 'Deploy fish seed',
    });

    farmedFishContractDto.registrationContract =
      systemconfig.registrationContract;

    result.data = await this.farmedFishModel.create({
      ...farmedFishContractDto,
    });

    return result;
  }

  async getFarmedFishContracts(queries: BaseQueryParams) {
    const result = new BaseResult();
    const { search, page, size, orderBy, desc } = queries;
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
        {
          geographicOrigin: { $regex: search, $options: 'i' },
        },
        {
          aquacultureWaterType: { $regex: search, $options: 'i' },
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
        key !== 'transactionHash'
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
        transactionType: TransactionType.UPDATE_FISH_SEED,
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

    result.data = await this.batchModel.create({
      ...batchDto,
    });

    return result;
  }

  async addFishSeed(addFishSeedDto: AddFishSeedDto) {
    const result = new BaseResult();

    result.data = this.fishSeedModel.create({
      ...addFishSeedDto,
    });

    return result;
  }

  async getFishSeeds(queries: QueryFishSeed) {
    const result = new BaseResult();
    const { search, page, size, orderBy, desc } = queries;
    const skipIndex = size * (page - 1);
    const query: FilterQuery<FishSeedDocument> = {};
    if (search) {
    }

    let sorter = {};
    if (orderBy) {
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
      if (item[key] !== updateFishSeedDto[key] && key !== 'transactionHash') {
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
        transactionType: TransactionType.UPDATE_FISH_SEED,
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
}
