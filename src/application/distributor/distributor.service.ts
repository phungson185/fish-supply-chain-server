import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseResult, PaginationDto } from 'src/domain/dtos';
import {
  BatchType,
  LogType,
  ProcessStatus,
  TransactionType,
} from 'src/domain/enum';
import {
  BatchDocument,
  Batchs,
  DistributorDocument,
  Distributors,
  FishProcessing,
  FishProcessingDocument,
  Log,
  LogDocument,
  UserDocument,
  Users,
} from 'src/domain/schemas';
import { compareObjects, noCompareKeys } from 'src/utils/utils';
import {
  ConfirmOrderDto,
  OrderDto,
  QueryOrderParams,
  UpdateOrderDto,
} from './dtos';
import { AppConfiguration, InjectAppConfig } from 'src/config/configuration';
import * as qrcode from 'qrcode';

@Injectable()
export class DistributorService {
  constructor(
    @InjectModel(FishProcessing.name)
    private readonly fishProcessingModel: Model<FishProcessingDocument>,
    @InjectModel(Distributors.name)
    private readonly distributorModel: Model<DistributorDocument>,
    @InjectModel(Users.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Batchs.name)
    private readonly batchModel: Model<BatchDocument>,
    @InjectModel(Log.name)
    private readonly logModel: Model<LogDocument>,
    @InjectAppConfig() private appConfig: AppConfiguration,
  ) {}

  async createOrder(orderDto: OrderDto) {
    const result = new BaseResult();
    const {
      orderer,
      quantityOfFishPackageOrdered,
      receiver,
      fishProcessingId,
    } = orderDto;

    const purcharser = await this.userModel.findById(orderer);
    if (!purcharser) {
      throw new NotFoundException('Purchaser not found');
    }

    const seller = await this.userModel.findById(receiver);
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    const fishProcessing = await this.fishProcessingModel.findById(
      fishProcessingId,
    );
    if (!fishProcessing) {
      throw new NotFoundException('Fish processing not found');
    }

    result.data = await this.distributorModel.create({
      ...orderDto,
      owner: orderer,
      numberOfPackets: quantityOfFishPackageOrdered,
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
      orderBy,
      desc,
      status,
      receiver,
      orderer,
      disable,
      listing,
      isHavePackets,
    } = queries;
    const skipIndex = size * (page - 1);
    const query: FilterQuery<DistributorDocument> = {};

    if (status) {
      query.status = status;
    }

    if (orderer) {
      query.orderer = orderer;
    }

    if (receiver) {
      query.receiver = receiver;
    }

    if (disable !== undefined) {
      query.disable = disable;
    }

    if (listing !== undefined) {
      query.listing = listing;
    }

    if (isHavePackets) {
      query.numberOfPackets = { $gt: 0 };
    }

    // if (search) {
    //   query.$or = [
    //     {
    //       fishSeedsPurchaser: { $regex: search, $options: 'i' },
    //     },
    //     {
    //       fishSeedsSeller: { $regex: search, $options: 'i' },
    //     },
    //   ];
    // }

    let sorter = {};
    if (orderBy) {
      switch (orderBy) {
        case 'quantityOfFishPackageOrdered':
          sorter = desc
            ? { quantityOfFishPackageOrdered: 'desc', _id: 'desc' }
            : { quantityOfFishPackageOrdered: 'asc', _id: 'asc' };
          break;
        default:
          sorter = desc
            ? { createdAt: 'desc', _id: 'desc' }
            : { createdAt: 'asc', _id: 'asc' };
          break;
      }
    }

    const items = await this.distributorModel
      .find(query)
      .populate('fishProcessingId')
      .populate('orderer')
      .populate('receiver')
      .populate('owner')
      .sort({ updatedAt: 'desc', _id: 'desc' })
      .skip(skipIndex)
      .limit(size);
    const total = await this.distributorModel.countDocuments(query);

    result.data = new PaginationDto<Distributors>(items, total, page, size);
    return result;
  }

  async confirmOrder(orderId: string, confirmOrderDto: ConfirmOrderDto) {
    const result = new BaseResult();
    const { status, transactionHash } = confirmOrderDto;

    const distributor = await this.distributorModel.findById(orderId).populate({
      path: 'fishProcessingId',
      populate: {
        path: 'fishProcessorId',
        populate: {
          path: 'fishFarmerId',
          populate: {
            path: 'farmedFishId',
          },
        },
      },
    });
    if (!distributor) {
      throw new NotFoundException('Order not found');
    }

    if (
      [ProcessStatus.Accepted, ProcessStatus.Rejected].includes(status) &&
      distributor.status !== ProcessStatus.Pending
    ) {
      throw new BadRequestException('Invalid status');
    }

    if (
      [ProcessStatus.Received].includes(status) &&
      distributor.status !== ProcessStatus.Accepted
    ) {
      throw new BadRequestException('The shipment has not arrived yet');
    }

    if (status == ProcessStatus.Received) {
      const batch = await this.batchModel.create({
        farmedFishId:
          distributor.fishProcessingId.fishProcessorId.fishFarmerId
            .farmedFishId,
        fishFarmerId: distributor.fishProcessingId.fishProcessorId.fishFarmerId,
        fishProcessingId: distributor.fishProcessingId,
        distributorId: distributor.id,
        lastChainPoint: 'distributorId',
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

    result.data = await this.distributorModel.findByIdAndUpdate(
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

  async updateOrder(orderId: string, updateOrderDto: UpdateOrderDto) {
    const result = new BaseResult();

    const distributor = await this.distributorModel.findById(orderId);
    if (!distributor) {
      throw new NotFoundException('Product not found');
    }

    result.data = await this.distributorModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          ...updateOrderDto,
        },
      },
      { new: true },
    );

    let isDifferent = false;
    Object.keys(updateOrderDto).forEach((key) => {
      if (
        distributor[key] !== updateOrderDto[key] &&
        !noCompareKeys.includes(key)
      ) {
        isDifferent = true;
      }
    });

    if (isDifferent) {
      const { oldData, newData } = compareObjects(
        distributor.toObject(),
        updateOrderDto,
      );

      await this.logModel.create({
        objectId: distributor.id,
        owner: distributor.owner,
        transactionType: TransactionType.PRODUCT,
        logType: LogType.API,
        message: `Update product status`,
        oldData,
        newData,
        title: 'Update product status',
      });
    }

    return result;
  }

  async getProfileInventory(userId: string) {
    const result = new BaseResult();

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const distributor = await this.distributorModel
      .find({
        owner: userId,
        status: ProcessStatus.Received,
        disable: false,
        listing: true,
      })
      .countDocuments();

    result.data = {
      user,
      distributor,
    };

    return result;
  }
}
