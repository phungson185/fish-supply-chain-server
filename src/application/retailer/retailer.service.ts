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
  Log,
  LogDocument,
  RetailerDocument,
  Retailers,
  UserDocument,
  Users,
} from 'src/domain/schemas';
import {
  ConfirmOrderDto,
  OrderDto,
  QueryOrderParams,
  UpdateOrderDto,
} from './dtos';
import { compareObjects, noCompareKeys } from 'src/utils/utils';

@Injectable()
export class RetailerService {
  constructor(
    @InjectModel(Distributors.name)
    private readonly distributorModel: Model<DistributorDocument>,
    @InjectModel(Retailers.name)
    private readonly retailerModel: Model<RetailerDocument>,
    @InjectModel(Users.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Batchs.name)
    private readonly batchModel: Model<BatchDocument>,
    @InjectModel(Log.name)
    private readonly logModel: Model<LogDocument>,
  ) {}

  async createOrder(orderDto: OrderDto) {
    const result = new BaseResult();
    const { buyer, seller, numberOfFishPackagesOrdered, distributorId } =
      orderDto;

    const buyerr = await this.userModel.findById(buyer);
    if (!buyerr) {
      throw new NotFoundException('Buyer not found');
    }

    const sellerr = await this.userModel.findById(seller);
    if (!sellerr) {
      throw new NotFoundException('Seller not found');
    }

    const distributor = await this.distributorModel.findById(distributorId);
    if (!distributor) {
      throw new NotFoundException('Distributor not found');
    }

    result.data = await this.retailerModel.create({
      ...orderDto,
      owner: buyerr,
      numberOfPackets: numberOfFishPackagesOrdered,
    });

    if ((result.data as any)._id) {
      await this.logModel.create({
        objectId: (result.data as any)._id,
        transactionType: TransactionType.CREATE_ORDER,
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
      buyer,
      disable,
      isHavePackets,
      listing,
      seller,
    } = queries;
    const skipIndex = size * (page - 1);
    const query: FilterQuery<RetailerDocument> = {};
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

    if (status) {
      query.status = status;
    }

    if (buyer) {
      query.buyer = buyer;
    }

    if (seller) {
      query.seller = seller;
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

    let sorter = {};
    if (orderBy) {
      switch (orderBy) {
        case 'numberOfFishPackagesOrdered':
          sorter = desc
            ? { numberOfFishPackagesOrdered: 'desc', _id: 'desc' }
            : { numberOfFishPackagesOrdered: 'asc', _id: 'asc' };
          break;
        default:
          sorter = desc
            ? { createdAt: 'desc', _id: 'desc' }
            : { createdAt: 'asc', _id: 'asc' };
          break;
      }
    }

    const items = await this.retailerModel
      .find(query)
      .populate('buyer')
      .populate('seller')
      .populate('owner')
      .populate({
        path: 'distributorId',
        populate: {
          path: 'fishProcessingId',
        },
      })
      .sort({ updatedAt: 'desc', _id: 'desc' })
      .skip(skipIndex)
      .limit(size);
    const total = await this.retailerModel.countDocuments(query);

    result.data = new PaginationDto<Retailers>(items, total, page, size);
    return result;
  }

  async confirmOrder(orderId: string, confirmOrderDto: ConfirmOrderDto) {
    const result = new BaseResult();
    const { status } = confirmOrderDto;

    const retailer = await this.retailerModel.findById(orderId).populate({
      path: 'distributorId',
      populate: {
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
      },
    });
    if (!retailer) {
      throw new NotFoundException('Order not found');
    }

    if (
      [ProcessStatus.Accepted, ProcessStatus.Rejected].includes(status) &&
      retailer.status !== ProcessStatus.Pending
    ) {
      throw new BadRequestException('Invalid status');
    }

    if (
      [ProcessStatus.Received].includes(status) &&
      retailer.status !== ProcessStatus.Accepted
    ) {
      throw new BadRequestException('The shipment has not arrived yet');
    }

    if (status == ProcessStatus.Received) {
      await this.batchModel.create({
        farmedFishId:
          retailer.distributorId.fishProcessingId.fishProcessorId.fishFarmerId
            .farmedFishId,
        fishFarmerId:
          retailer.distributorId.fishProcessingId.fishProcessorId.fishFarmerId,
        fishProcessingId: retailer.distributorId.fishProcessingId,
        distributorId: retailer.distributorId,
        retailerId: retailer,
        type: BatchType.FishSeedCompany,
      });
    }

    await this.logModel.create({
      objectId: orderId,
      transactionType: TransactionType.UPDATE_ORDER_STATUS,
      newData: status,
    });

    result.data = await this.retailerModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status,
        },
      },
      { new: true },
    );

    return result;
  }

  async getProfileInventory(userId: string) {
    const result = new BaseResult();

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const distributor = await this.retailerModel
      .find({ owner: userId })
      .countDocuments();

    result.data = {
      user,
      distributor,
    };

    return result;
  }

  async updateOrder(orderId: string, updateOrderDto: UpdateOrderDto) {
    const result = new BaseResult();

    const retailer = await this.retailerModel.findById(orderId);
    if (!retailer) {
      throw new NotFoundException('Product not found');
    }

    result.data = await this.retailerModel.findByIdAndUpdate(
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
        retailer[key] !== updateOrderDto[key] &&
        !noCompareKeys.includes(key)
      ) {
        isDifferent = true;
      }
    });

    if (isDifferent) {
      const { oldData, newData } = compareObjects(
        retailer.toObject(),
        updateOrderDto,
      );

      await this.logModel.create({
        objectId: retailer.id,
        owner: retailer.owner,
        transactionType: TransactionType.UPDATE_PRODUCT,
        logType: LogType.API,
        message: `Update product status`,
        oldData,
        newData,
        title: 'Update product status',
      });
    }

    return result;
  }
}
