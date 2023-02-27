import { Injectable } from '@nestjs/common';
import {
  NotFoundException,
  BadRequestException,
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
  FishProcessorDocument,
  FishProcessors,
  UserDocument,
  Users,
} from 'src/domain/schemas';
import { ConfirmOrderDto, OrderDto, QueryOrderParams } from './dtos';

@Injectable()
export class DistributorService {
  constructor(
    @InjectModel(FishProcessors.name)
    private readonly fishProcessorModel: Model<FishProcessorDocument>,
    @InjectModel(Distributors.name)
    private readonly distributorModel: Model<DistributorDocument>,
    @InjectModel(Users.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Batchs.name)
    private readonly batchModel: Model<BatchDocument>,
  ) {}

  async createOrder(orderDto: OrderDto) {
    const result = new BaseResult();
    const {
      orderer,
      processedFishPackageId,
      processorId,
      quantityOfFishPackageOrdered,
      receiver,
      processedFishPurchaseOrderId,
    } = orderDto;

    const purcharser = await this.userModel.findOne({
      address: orderer,
    });
    if (!purcharser) {
      throw new NotFoundException('Purchaser not found');
    }

    const seller = await this.userModel.findOne({
      address: receiver,
    });
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    const fishProcessor = await this.fishProcessorModel.findById(processorId);
    if (!fishProcessor) {
      throw new NotFoundException('Fish processor not found');
    }

    Object.assign(orderDto, {
      orderer: purcharser,
      receiver: seller,
      processedFishPackageId,
      quantityOfFishPackageOrdered,
      processorId: fishProcessor,
      processedFishPurchaseOrderId,
      owner: purcharser,
    });

    result.data = await this.distributorModel.create({
      ...orderDto,
    });

    return result;
  }

  async getOrders(queries: QueryOrderParams) {
    const result = new BaseResult();
    const { search, page, size, orderBy, desc, status } = queries;
    const skipIndex = size * (page - 1);
    const query: FilterQuery<DistributorDocument> = {};
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
      .populate('processorId')
      .populate('orderer')
      .populate('receiver')
      .populate('owner')
      .sort(sorter)
      .skip(skipIndex)
      .limit(size);
    const total = await this.distributorModel.countDocuments(query);

    result.data = new PaginationDto<Distributors>(items, total, page, size);
    return result;
  }

  async confirmOrder(orderId: string, confirmOrderDto: ConfirmOrderDto) {
    const result = new BaseResult();
    const { status } = confirmOrderDto;

    const distributor = await this.distributorModel.findById(orderId).populate({
      path: 'processorId',
      populate: {
        path: 'fishFarmerId',
        populate: {
          path: 'farmedFishId',
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
      await this.batchModel.create({
        farmedFishId: distributor.processorId.fishFarmerId.farmedFishId,
        fishFarmerId: distributor.processorId.fishFarmerId,
        fishProcessorId: distributor.processorId,
        distributorId: distributor,
        type: BatchType.FishSeedCompany,
      });
    }

    result.data = await this.distributorModel.findByIdAndUpdate(
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
