import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseResult, PaginationDto } from 'src/domain/dtos';
import { BatchType, ProcessStatus } from 'src/domain/enum';
import {
  BatchDocument,
  Batchs,
  DistributorDocument,
  Distributors,
  RetailerDocument,
  Retailers,
  UserDocument,
  Users,
} from 'src/domain/schemas';
import { ConfirmOrderDto, OrderDto, QueryOrderParams } from './dtos';

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
  ) {}

  async createOrder(orderDto: OrderDto) {
    const result = new BaseResult();
    const {
      buyer,
      seller,
      numberOfFishPackagesOrdered,
      processedFishPurchaseOrderID,
      retailerPurchaseOrderID,
      distributorId,
    } = orderDto;

    const purcharser = await this.userModel.findOne({
      address: buyer,
    });
    if (!purcharser) {
      throw new NotFoundException('Purchaser not found');
    }

    const sellerr = await this.userModel.findOne({
      address: seller,
    });
    if (!sellerr) {
      throw new NotFoundException('Seller not found');
    }

    const distributor = await this.distributorModel.findById(distributorId);
    if (!distributor) {
      throw new NotFoundException('Distributor not found');
    }

    Object.assign(orderDto, {
      buyer: purcharser,
      seller: sellerr,
      distributorId: distributor,
      numberOfFishPackagesOrdered,
      processedFishPurchaseOrderID,
      retailerPurchaseOrderID,
      owner: purcharser,
    });

    result.data = await this.retailerModel.create({
      ...orderDto,
    });

    return result;
  }

  async getOrders(queries: QueryOrderParams) {
    const result = new BaseResult();
    const { search, page, size, orderBy, desc, status } = queries;
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
          path: 'processorId',
        },
      })
      .sort(sorter)
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
        path: 'processorId',
        populate: {
          path: 'fishFarmerId',
          populate: {
            path: 'farmedFishId',
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
          retailer.distributorId.processorId.fishFarmerId.farmedFishId,
        fishFarmerId: retailer.distributorId.processorId.fishFarmerId,
        fishProcessorId: retailer.distributorId.processorId,
        distributorId: retailer.distributorId,
        retailerId: retailer,
        type: BatchType.FishSeedCompany,
      });
    }

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
}
