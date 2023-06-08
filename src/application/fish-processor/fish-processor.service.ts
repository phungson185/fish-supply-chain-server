import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseQueryParams, BaseResult, PaginationDto } from 'src/domain/dtos';
import {
  BatchType,
  LogType,
  ProcessStatus,
  TransactionType,
} from 'src/domain/enum';
import {
  BatchDocument,
  Batchs,
  FishFarmerDocument,
  FishFarmers,
  FishProcessing,
  FishProcessingDocument,
  FishProcessingSchema,
  FishProcessorDocument,
  FishProcessors,
  Log,
  LogDocument,
  UserDocument,
  Users,
} from 'src/domain/schemas';
import {
  ConfirmOrderDto,
  CreateProcessingContractDto,
  OrderDto,
  QueryOrderParams,
  QueryProcessingContractDto,
  UpdateProcessingContractDto,
} from './dtos';
import { compareObjects, noCompareKeys } from 'src/utils/utils';
import { AppConfiguration, InjectAppConfig } from 'src/config/configuration';
import * as qrcode from 'qrcode';

@Injectable()
export class FishProcessorService {
  constructor(
    @InjectModel(FishFarmers.name)
    private readonly fishFarmerModel: Model<FishFarmerDocument>,
    @InjectModel(Users.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(FishProcessors.name)
    private readonly fishProcessorModel: Model<FishProcessorDocument>,
    @InjectModel(FishProcessing.name)
    private readonly fishProcessingModel: Model<FishProcessingDocument>,
    @InjectModel(Batchs.name)
    private readonly batchModel: Model<BatchDocument>,
    @InjectModel(Log.name)
    private readonly logModel: Model<LogDocument>,
    @InjectAppConfig() private appConfig: AppConfiguration,
  ) {}

  async createOrder(orderDto: OrderDto) {
    const result = new BaseResult();
    const {
      farmedFishPurchaser,
      farmedFishSeller,
      fishFarmerId,
      numberOfFishOrdered,
      speciesName,
      IPFSHash,
      farmedFishPurchaseOrderID,
      geographicOrigin,
      image,
      methodOfReproduction,
      transactionHash,
    } = orderDto;

    const purcharser = await this.userModel.findOne({
      address: farmedFishPurchaser,
    });
    if (!purcharser) {
      throw new NotFoundException('Purchaser not found');
    }

    const seller = await this.userModel.findOne({
      address: farmedFishSeller,
    });
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    const fishFarmer = await this.fishFarmerModel.findById(fishFarmerId);
    if (!fishFarmer) {
      throw new NotFoundException('Fish farmer not found');
    }

    Object.assign(orderDto, {
      fishFarmerId: fishFarmer,
      farmedFishPurchaser: purcharser,
      farmedFishSeller: seller,
      speciesName,
      numberOfFishOrdered,
      owner: purcharser,
      IPFSHash,
      farmedFishPurchaseOrderID,
      geographicOrigin,
      image,
      methodOfReproduction,
      transactionHash,
    });

    result.data = await this.fishProcessorModel.create({
      ...orderDto,
    });

    if ((result.data as any)._id) {
      await this.logModel.create({
        objectId: (result.data as any)._id,
        owner: purcharser,
        transactionType: TransactionType.ORDER,
        newData: ProcessStatus.Pending,
      });
    }

    return result;
  }

  async getOrders(queries: QueryOrderParams) {
    const result = new BaseResult();
    const { search, page, size, orderBy, desc, status } = queries;
    const skipIndex = size * (page - 1);
    const query: FilterQuery<FishProcessorDocument> = {};
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
        case 'numberOfFishOrdered':
          sorter = desc
            ? { numberOfFishOrdered: 'desc', _id: 'desc' }
            : { numberOfFishOrdered: 'asc', _id: 'asc' };
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

    if (status) {
      query.status = status;
    }

    const items = await this.fishProcessorModel
      .find(query)
      .populate('farmedFishPurchaser')
      .populate('farmedFishSeller')
      .populate({
        path: 'fishFarmerId',
        populate: [
          {
            path: 'farmedFishId',
          },
        ],
      })
      .sort(sorter)
      .skip(skipIndex)
      .limit(size);
    const total = await this.fishProcessorModel.countDocuments(query);

    result.data = new PaginationDto<FishProcessors>(items, total, page, size);
    return result;
  }

  async confirmOrder(orderId: string, confirmOrderDto: ConfirmOrderDto) {
    const result = new BaseResult();
    const { status, transactionHash } = confirmOrderDto;

    const fishProcessor = await this.fishProcessorModel
      .findById(orderId)
      .populate('fishFarmerId');
    if (!fishProcessor) {
      throw new NotFoundException('Order not found');
    }

    if (
      [ProcessStatus.Accepted, ProcessStatus.Rejected].includes(status) &&
      fishProcessor.status !== ProcessStatus.Pending
    ) {
      throw new BadRequestException('Invalid status');
    }

    if (
      [ProcessStatus.Received].includes(status) &&
      fishProcessor.status !== ProcessStatus.Accepted
    ) {
      throw new BadRequestException('The shipment has not arrived yet');
    }

    await this.logModel.create({
      objectId: orderId,
      transactionType: TransactionType.ORDER,
      newData: status,
    });

    result.data = await this.fishProcessorModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status,
          transactionHash,
        },
      },
      { new: true },
    );

    return result;
  }

  async createProcessingContract(
    userId: string,
    createProcessingContractDto: CreateProcessingContractDto,
  ) {
    const result = new BaseResult();
    const {
      fishProcessorId,
      fishProcessor,
      processingContract,
      numberOfPackets,
      processedSpeciesName,
    } = createProcessingContractDto;

    const fishhProcessor = await this.userModel.findById(fishProcessor);
    if (!fishhProcessor) {
      throw new NotFoundException('Fish processor not found');
    }

    const order = await this.fishProcessorModel
      .findById(fishProcessorId)
      .populate({
        path: 'fishFarmerId',
        populate: [
          {
            path: 'farmedFishId',
          },
        ],
      });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const fishProcessing = await this.fishProcessingModel.create({
      ...createProcessingContractDto,
      owner: userId,
    });

    const { oldData, newData } = compareObjects(
      {},
      createProcessingContractDto,
    );

    await this.logModel.create({
      objectId: processingContract,
      owner: userId,
      transactionType: TransactionType.CONTRACT,
      logType: LogType.BLOCKCHAIN,
      message: `Deploy ${numberOfPackets} packets of ${processedSpeciesName} fish`,
      oldData: oldData,
      newData: newData,
      title: 'Deploy processing contract',
    });

    const batch = await this.batchModel.create({
      fishProcessingId: fishProcessing,
      fishFarmerId: order.fishFarmerId,
      farmedFishId: order.fishFarmerId.farmedFishId,
      lastChainPoint: 'fishProcessingId',
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

    fishProcessing.qrCode = qrCodeString;
    await fishProcessing.save();

    return result;
  }

  async updateProcessingContract(
    id: string,
    body: UpdateProcessingContractDto,
  ) {
    const result = new BaseResult();
    const fishProcessing = await this.fishProcessingModel.findById(id);
    if (!fishProcessing) {
      throw new NotFoundException('Processing contract not found');
    }

    let isDifferent = false;
    Object.keys(body).forEach((key) => {
      if (['dateOfProcessing', 'dateOfExpiry'].includes(key)) {
        if (Number(fishProcessing[key]) !== Number(body[key])) {
          isDifferent = true;
        }
        return;
      }
      if (fishProcessing[key] !== body[key] && !noCompareKeys.includes(key)) {
        isDifferent = true;
      }
    });

    if (isDifferent) {
      const { oldData, newData } = compareObjects(
        fishProcessing.toObject(),
        body,
      );

      await this.logModel.create({
        objectId: fishProcessing.processingContract,
        transactionHash: body.transactionHash,
        owner: fishProcessing.fishProcessor,
        transactionType: TransactionType.CONTRACT,
        logType: LogType.BLOCKCHAIN,
        message: `Update processing contract`,
        oldData,
        newData,
        title: 'Update processing contract',
      });
    }

    result.data = await this.fishProcessingModel.findByIdAndUpdate(
      id,
      {
        $set: body,
      },
      { new: true },
    );

    return result;
  }

  async getProcessingContracts(queries: QueryProcessingContractDto) {
    const result = new BaseResult();
    const {
      search,
      page,
      size,
      orderBy,
      desc,
      fishProcessor,
      disable,
      fishProcessorId,
      isHavePackets,
      listing,
      dateFilter,
      fromDate,
      toDate,
    } = queries;
    const skipIndex = size * (page - 1);
    const query: FilterQuery<FishProcessingDocument> = {};

    if (search) {
      query.$or = [{ processedSpeciesName: { $regex: search, $options: 'i' } }];
    }

    if (fishProcessorId) {
      query.fishProcessorId = fishProcessorId;
    }

    if (fishProcessor) {
      query.id = fishProcessor;
    }

    if (disable !== undefined) {
      query.disable = disable;
    }

    if (isHavePackets !== undefined && isHavePackets) {
      query.numberOfPackets = { $gt: 0 };
    }

    if (listing !== undefined) {
      query.listing = listing;
    }

    if (dateFilter) {
      if (!fromDate || !toDate) {
        throw new BadRequestException('From date and to date are required');
      }

      query[dateFilter] = {
        $gte: fromDate,
        $lte: toDate,
      };
    }

    let sorter = {};
    if (orderBy) {
      switch (orderBy) {
        case 'speciesName':
          sorter = desc
            ? { speciesName: 'desc', _id: 'desc' }
            : { speciesName: 'asc', _id: 'asc' };
          break;
        case 'numberOfFishOrdered':
          sorter = desc
            ? { numberOfFishOrdered: 'desc', _id: 'desc' }
            : { numberOfFishOrdered: 'asc', _id: 'asc' };
          break;
        default:
          sorter = desc
            ? { updatedAt: 'desc', _id: 'desc' }
            : { updatedAt: 'asc', _id: 'asc' };
          break;
      }
    }

    const items = await this.fishProcessingModel
      .find(query)
      .populate('fishProcessorId')
      .populate('fishProcessor')
      .sort({ updatedAt: 'desc', _id: 'desc' })
      .skip(skipIndex)
      .limit(size);
    const total = await this.fishProcessingModel.countDocuments(query);

    result.data = new PaginationDto<FishProcessing>(items, total, page, size);
    return result;
  }

  async getProcessingContract(processingContractId: string) {
    const result = new BaseResult();
    const processingContract = await this.fishProcessingModel
      .findById(processingContractId)
      .populate('fishProcessorId')
      .populate('fishProcessor');
    if (!processingContract) {
      throw new NotFoundException('Processing contract not found');
    }

    result.data = processingContract;
    return result;
  }

  async getProfileInventory(userId: string) {
    const result = new BaseResult();

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const fishProcessing = await this.fishProcessingModel
      .find({
        fishProcessor: userId,
        status: ProcessStatus.Received,
        disable: false,
        listing: true,
      })
      .countDocuments();

    result.data = {
      user,
      fishProcessing,
    };

    return result;
  }
}
