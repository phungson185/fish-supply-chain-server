import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { BaseResult, PaginationDto } from 'src/domain/dtos';
import {
  BatchType,
  GeographicOrigin,
  LogType,
  MethodOfReproduction,
  ProcessStatus,
  TransactionType,
} from 'src/domain/enum';
import {
  BatchDocument,
  Batchs,
  FarmedFishDocument,
  FarmedFishs,
  FishFarmerDocument,
  FishFarmers,
  FishProcessorDocument,
  FishProcessors,
  Log,
  LogDocument,
  UserDocument,
  Users,
} from 'src/domain/schemas';
import {
  ConfirmOrderDto,
  OrderDto,
  QueryOrderParams,
  UpdateGrowthDetailsDto,
} from './dtos';
import { compareObjects, noCompareKeys } from 'src/utils/utils';
import { AppConfiguration, InjectAppConfig } from 'src/config/configuration';
import * as qrcode from 'qrcode';

@Injectable()
export class FishFarmerService {
  constructor(
    @InjectModel(FishFarmers.name)
    private readonly fishFarmerModel: Model<FishFarmerDocument>,
    @InjectModel(FarmedFishs.name)
    private readonly farmedFishModel: Model<FarmedFishDocument>,
    @InjectModel(Users.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(FishProcessors.name)
    private readonly fishProcessorModel: Model<FishProcessorDocument>,
    @InjectModel(Batchs.name)
    private readonly batchModel: Model<BatchDocument>,
    @InjectModel(Log.name)
    private readonly logModel: Model<LogDocument>,
    @InjectAppConfig() private appConfig: AppConfiguration,
  ) {}

  async createOrder(orderDto: OrderDto) {
    const result = new BaseResult();
    const {
      fishSeedsPurchaser,
      fishSeedsSeller,
      farmedFishId,
      fishSeedPurchaseOrderId,
      fishSeedsPurchaseOrderDetailsStatus,
      numberOfFishSeedsOrdered,
    } = orderDto;

    const purcharser = await this.userModel.findOne({
      address: fishSeedsPurchaser,
    });
    if (!purcharser) {
      throw new NotFoundException('Purchaser not found');
    }

    const seller = await this.userModel.findOne({
      address: fishSeedsSeller,
    });
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    const farmedFish = await this.farmedFishModel.findById(
      orderDto.farmedFishId,
    );
    if (!farmedFish) {
      throw new NotFoundException('Farmed fish not found');
    }

    Object.assign(orderDto, {
      farmedFishId: farmedFish,
      fishSeedsPurchaser: purcharser,
      fishSeedsSeller: seller,
      owner: purcharser,
      numberOfFishSeedsOrdered: orderDto.numberOfFishSeedsOrdered,
      geographicOrigin: farmedFish.geographicOrigin,
      methodOfReproduction: farmedFish.methodOfReproduction,
      waterTemperature: farmedFish.waterTemperature,
      image: farmedFish.image,
      speciesName: farmedFish.speciesName,
      IPFSHash: farmedFish.IPFSHash,
      totalNumberOfFish: orderDto.numberOfFishSeedsOrdered,
      transactionHash: orderDto.transactionHash,
    });

    result.data = await this.fishFarmerModel.create({
      ...orderDto,
    });

    if ((result.data as any)._id) {
      await this.logModel.create({
        objectId: (result.data as any)._id,
        transactionType: TransactionType.ORDER,
        newData: ProcessStatus.Pending,
      });
    }

    return result;
  }

  async getOrders(queries: QueryOrderParams) {
    const result = new BaseResult();
    const {
      search,
      page,
      size,
      orderBy = 'updatedAt',
      desc = true,
      id,
      fishSeedsPurchaseOrderDetailsStatus,
      fishSeedsPurchaser,
      fishSeedsSeller,
    } = queries;
    const skipIndex = size * (page - 1);
    const query: FilterQuery<FishFarmerDocument> = {};
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
        case 'totalNumberOfFish':
          sorter = desc
            ? { totalNumberOfFish: 'desc', _id: 'desc' }
            : { totalNumberOfFish: 'asc', _id: 'asc' };
          break;
        case 'waterTemperature':
          sorter = desc
            ? { waterTemperature: 'desc', _id: 'desc' }
            : { waterTemperature: 'asc', _id: 'asc' };
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
        case 'fishWeight':
          sorter = desc
            ? { fishWeight: 'desc', _id: 'desc' }
            : { fishWeight: 'asc', _id: 'asc' };
          break;
        case 'updatedAt':
          sorter = desc
            ? { updatedAt: 'desc', _id: 'desc' }
            : { updatedAt: 'asc', _id: 'asc' };
          break;
        default:
          sorter = desc
            ? { createdAt: 'desc', _id: 'desc' }
            : { createdAt: 'asc', _id: 'asc' };
          break;
      }
    }

    if (id) {
      query._id = id;
    }

    if (fishSeedsPurchaseOrderDetailsStatus) {
      query.fishSeedsPurchaseOrderDetailsStatus =
        fishSeedsPurchaseOrderDetailsStatus;
    }

    if (fishSeedsPurchaser) {
      query.fishSeedsPurchaser = fishSeedsPurchaser;
    }

    if (fishSeedsSeller) {
      query.fishSeedsSeller = fishSeedsSeller;
    }

    const items = await this.fishFarmerModel
      .find(query)
      .populate('fishSeedsPurchaser')
      .populate('fishSeedsSeller')
      .populate('farmedFishId')
      .populate('owner')
      .populate('updater')
      .sort(sorter)
      .skip(skipIndex)
      .limit(size);
    const total = await this.fishFarmerModel.countDocuments(query);

    result.data = new PaginationDto<FishFarmers>(items, total, page, size);
    return result;
  }

  async getOrder(id: string) {
    const result = new BaseResult();
    const item = await this.fishFarmerModel
      .findById(id)
      .populate('fishSeedsPurchaser')
      .populate('fishSeedsSeller')
      .populate('farmedFishId')
      .populate('owner')
      .populate('updater');
    if (!item) {
      throw new NotFoundException('Order not found');
    }

    result.data = item;
    return result;
  }

  async confirmOrder(orderId: string, confirmOrderDto: ConfirmOrderDto) {
    const result = new BaseResult();
    const { status, numberOfFishSeedsAvailable, transactionHash } =
      confirmOrderDto;

    const fishFarmer = await this.fishFarmerModel.findById(orderId);
    if (!fishFarmer) {
      throw new NotFoundException('Order not found');
    }

    if (
      [ProcessStatus.Accepted, ProcessStatus.Rejected].includes(status) &&
      fishFarmer.fishSeedsPurchaseOrderDetailsStatus !== ProcessStatus.Pending
    ) {
      throw new BadRequestException('Invalid status');
    }

    if (
      [ProcessStatus.Received].includes(status) &&
      fishFarmer.fishSeedsPurchaseOrderDetailsStatus !== ProcessStatus.Accepted
    ) {
      throw new BadRequestException('The shipment has not arrived yet');
    }

    if (status == ProcessStatus.Received) {
      const batch = await this.batchModel.create({
        farmedFishId: fishFarmer.farmedFishId,
        fishFarmerId: fishFarmer._id,
        lastChainPoint: 'fishFarmerId',
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
    }

    await this.logModel.create({
      objectId: orderId,
      transactionType: TransactionType.ORDER,
      newData: status,
    });

    await this.farmedFishModel.findByIdAndUpdate(
      fishFarmer.farmedFishId,
      {
        $set: {
          numberOfFishSeedsAvailable,
        },
      },
      { new: true },
    );

    result.data = await this.fishFarmerModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          fishSeedsPurchaseOrderDetailsStatus: status,
          transactionHash,
        },
      },
      { new: true },
    );

    return result;
  }

  async updateGrowthDetails(
    orderId: string,
    userId: string,
    updateGrowthDetailsDto: UpdateGrowthDetailsDto,
  ) {
    const result = new BaseResult();
    const {
      IPFSHash,
      fishWeight,
      image,
      transactionHash,
      waterTemperature,
      totalNumberOfFish,
      orderable,
      farmedFishGrowthDetailsID,
    } = updateGrowthDetailsDto;

    const growthDetail = await this.fishFarmerModel.findById(orderId);
    if (!growthDetail) {
      throw new NotFoundException('Order not found');
    }

    if (
      growthDetail.fishSeedsPurchaseOrderDetailsStatus !==
      ProcessStatus.Received
    ) {
      throw new BadRequestException('Invalid status');
    }

    let isDifferent = false;
    Object.keys(updateGrowthDetailsDto).forEach((key) => {
      if (
        growthDetail[key] !== updateGrowthDetailsDto[key] &&
        !noCompareKeys.includes(key)
      ) {
        isDifferent = true;
      }
    });

    if (isDifferent) {
      const { oldData, newData } = compareObjects(
        growthDetail.toObject(),
        updateGrowthDetailsDto,
      );

      await this.logModel.create({
        objectId: orderId,
        transactionType: TransactionType.FISH_GROWTH,
        logType: LogType.BLOCKCHAIN,
        oldData,
        newData,
        transactionHash,
        owner: userId,
        message: `Update ${growthDetail.speciesName} growth details`,
        title: `Update fish growth details`,
      });

      result.data = await this.fishFarmerModel.findByIdAndUpdate(
        orderId,
        {
          $set: {
            IPFSHash,
            fishWeight,
            waterTemperature,
            image,
            totalNumberOfFish,
            updater: userId,
            orderable,
            farmedFishGrowthDetailsID,
          },
        },
        { new: true },
      );
    }

    return result;
  }

  async summaryCommon(userId: string) {
    const result = new BaseResult();

    const totalOrderToFishSeedCompany = await this.fishFarmerModel
      .find({
        owner: userId,
      })
      .countDocuments();

    const totalOrderFromFishProcessor = await this.fishProcessorModel
      .find({
        farmedFishSeller: userId,
      })
      .countDocuments();

    const averageFishWeight = await this.fishFarmerModel.aggregate([
      {
        $match: {
          owner: new Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          averageFishWeight: { $avg: '$fishWeight' },
        },
      },
      {
        $project: {
          _id: 0,
          averageFishWeight: 1,
        },
      },
    ]);

    const quantityOfOrdersForFishGrowth = await this.fishFarmerModel.aggregate([
      {
        $lookup: {
          from: 'fish-processors',
          localField: '_id',
          foreignField: 'fishFarmerId',
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
      totalOrderToFishSeedCompany,
      totalOrderFromFishProcessor,
      averageFishWeight: averageFishWeight[0]?.averageFishWeight || 0,
      quantityOfOrdersForFishGrowth,
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
          from: 'fish-farmers',
          localField: 'fishFarmerId',
          foreignField: '_id',
          as: 'fishFarmer',
        },
      },
      {
        $match: {
          farmedFishSeller: new Types.ObjectId(userId),
        },
      },
      { $unwind: '$fishFarmer' },
    ] as PipelineStage[];

    if (Object.values(GeographicOrigin).includes(geographicOrigin)) {
      filter.push({
        $match: {
          'fishFarmer.geographicOrigin': geographicOrigin,
        },
      });
    }

    if (Object.values(MethodOfReproduction).includes(methodOfReproduction)) {
      filter.push({
        $match: {
          'fishFarmer.methodOfReproduction': methodOfReproduction,
        },
      });
    }

    filter = [
      ...filter,
      {
        $addFields: {
          numberOfFishSeedsOrdered: '$fishFarmer.numberOfFishSeedsOrdered',
          speciesName: '$fishFarmer.speciesName',
          numberOfFishOrdered: '$numberOfFishOrdered',
        },
      },
      {
        $group: {
          _id: '$fishFarmer._id',
          numberOfFishSeedsOrdered: { $first: '$numberOfFishSeedsOrdered' },
          speciesName: { $first: '$fishFarmer.speciesName' },
          numberOfFishOrdered: { $sum: '$numberOfFishOrdered' },
        },
      },
      {
        $sort: { quantity: -1 },
      },
      {
        $project: {
          _id: 0,
          numberOfFishSeedsOrdered: 1,
          numberOfFishOrdered: 1,
          speciesName: 1,
        },
      },
    ];

    const topWithFilter = await this.fishProcessorModel.aggregate(filter);

    result.data = topWithFilter;

    return result;
  }
}
