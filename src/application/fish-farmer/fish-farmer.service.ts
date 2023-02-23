import { Injectable } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@nestjs/common/exceptions';
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
  UserDocument,
  Users,
} from 'src/domain/schemas';
import {
  ConfirmOrderDto,
  OrderDto,
  QueryOrderParams,
  UpdateGrowthDetailsDto,
} from './dtos';

@Injectable()
export class FishFarmerService {
  constructor(
    @InjectModel(FishFarmers.name)
    private readonly fishFarmerModel: Model<FishFarmerDocument>,
    @InjectModel(FarmedFishs.name)
    private readonly farmedFishModel: Model<FarmedFishDocument>,
    @InjectModel(Users.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Batchs.name)
    private readonly batchModel: Model<BatchDocument>,
  ) {}

  async createOrder(orderDto: OrderDto) {
    const result = new BaseResult();
    const { fishSeedsPurchaser, fishSeedsSeller } = orderDto;

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
      speciesName: farmedFish.speciesName,
      IPFSHash: farmedFish.IPFSHash,
      totalNumberOfFish: orderDto.numberOfFishSeedsOrdered,
    });

    result.data = await this.fishFarmerModel.create({
      ...orderDto,
    });

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
      fishSeedsPurchaseOrderDetailsStatus,
    } = queries;
    const skipIndex = size * (page - 1);
    const query: FilterQuery<FishFarmerDocument> = {};
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
        case 'numberOfFishSeedsOrdered':
          sorter = desc
            ? { speciesName: 'desc', _id: 'desc' }
            : { speciesName: 'asc', _id: 'asc' };
          break;
        case 'totalNumberOfFish':
          sorter = desc
            ? { totalNumberOfFish: 'desc', _id: 'desc' }
            : { totalNumberOfFish: 'asc', _id: 'asc' };
          break;
        case 'fishWeight':
          sorter = desc
            ? { fishWeight: 'desc', _id: 'desc' }
            : { fishWeight: 'asc', _id: 'asc' };
          break;
        default:
          sorter = desc
            ? { createdAt: 'desc', _id: 'desc' }
            : { createdAt: 'asc', _id: 'asc' };
          break;
      }
    }

    if (fishSeedsPurchaseOrderDetailsStatus) {
      query.fishSeedsPurchaseOrderDetailsStatus =
        fishSeedsPurchaseOrderDetailsStatus;
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

  async confirmOrder(orderId: string, confirmOrderDto: ConfirmOrderDto) {
    const result = new BaseResult();
    const { status } = confirmOrderDto;

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
      await this.batchModel.create({
        farmedFishId: fishFarmer.farmedFishId,
        fishFarmerId: fishFarmer._id,
        type: BatchType.FishSeedCompany,
      });
    }

    result.data = await this.fishFarmerModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          fishSeedsPurchaseOrderDetailsStatus: status,
        },
      },
      { new: true },
    );

    return result;
  }

  async updateGrowthDetails(orderId: string, userId: string, body: UpdateGrowthDetailsDto) {
    const result = new BaseResult();
    const { IPFSHash, fishWeight, speciesName, totalNumberOfFish } = body;

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

    result.data = await this.fishFarmerModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          IPFSHash,
          fishWeight,
          speciesName,
          totalNumberOfFish,
          updater: userId,
        },
      },
      { new: true },
    );

    return result;
  }
}
