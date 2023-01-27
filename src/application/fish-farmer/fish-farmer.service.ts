import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseQueryParams, BaseResult, PaginationDto } from 'src/domain/dtos';
import { FarmedFishDocument, FarmedFishs, FishFarmerDocument, FishFarmers, UserDocument, Users } from 'src/domain/schemas';
import { OrderDto } from './dtos';

@Injectable()
export class FishFarmerService {
  constructor(
    @InjectModel(FishFarmers.name)
    private readonly fishFarmerModel: Model<FishFarmerDocument>,
    @InjectModel(FarmedFishs.name)
    private readonly farmedFishModel: Model<FarmedFishDocument>,
    @InjectModel(Users.name)
    private readonly userModel: Model<UserDocument>,
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

    const farmedFish = await this.farmedFishModel.findById(orderDto.farmedFishId)
    if (!farmedFish) {
      throw new NotFoundException('Farmed fish not found');
    }

    Object.assign(orderDto, {
      farmedFishId: farmedFish,
      fishSeedsPurchaser: purcharser,
      fishSeedsSeller: seller,
      numberOfFishSeedsOrdered: orderDto.numberOfFishSeedsOrdered,
    });

    result.data = await this.fishFarmerModel.create({
      ...orderDto,
    });

    return result;
  }

  async getOrders(queries: BaseQueryParams) {
    const result = new BaseResult();
    const { search, page, size, orderBy, desc } = queries;
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
        default:
          sorter = desc
            ? { createdAt: 'desc', _id: 'desc' }
            : { createdAt: 'asc', _id: 'asc' };
          break;
      }
    }
    const items = await this.fishFarmerModel
      .find(query)
      .populate('fishSeedsPurchaser')
      .populate('fishSeedsSeller')
      .sort(sorter)
      .skip(skipIndex)
      .limit(size);
    const total = await this.fishFarmerModel.countDocuments(query);

    result.data = new PaginationDto<FishFarmers>(items, total, page, size);
    return result;
  }
}
