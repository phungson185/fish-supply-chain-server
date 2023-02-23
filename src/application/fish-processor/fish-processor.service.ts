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
  FarmedFishDocument,
  FarmedFishs,
  FishFarmerDocument,
  FishFarmers,
  FishProcessorDocument,
  FishProcessors,
  UserDocument,
  Users,
} from 'src/domain/schemas';
import { ConfirmOrderDto, OrderDto, QueryOrderParams } from './dtos';

@Injectable()
export class FishProcessorService {
  constructor(
    @InjectModel(FishFarmers.name)
    private readonly fishFarmerModel: Model<FishFarmerDocument>,
    @InjectModel(Users.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(FishProcessors.name)
    private readonly fishProcessorModel: Model<FishProcessorDocument>,
    @InjectModel(Batchs.name)
    private readonly batchModel: Model<BatchDocument>,
  ) {}

  async createOrder(orderDto: OrderDto) {
    const result = new BaseResult();
    const {
      farmedFishPurchaser,
      farmedFishSeller,
      fishFarmerId,
      numberOfFishOrdered,
      speciesName,
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
    });

    result.data = await this.fishProcessorModel.create({
      ...orderDto,
    });

    return result;
  }

  async getOrders(queries: QueryOrderParams) {
    const result = new BaseResult();
    const { search, page, size, orderBy, desc, status } = queries;
    const skipIndex = size * (page - 1);
    const query: FilterQuery<FishProcessorDocument> = {};
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
    const { status } = confirmOrderDto;

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

    if (status == ProcessStatus.Received) {
      await this.batchModel.create({
        farmedFishId: fishProcessor.fishFarmerId.farmedFishId,
        fishFarmerId: fishProcessor.fishFarmerId,
        fishProcessorId: fishProcessor,
        type: BatchType.FishSeedCompany,
      });
    }

    result.data = await this.fishProcessorModel.findByIdAndUpdate(
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
