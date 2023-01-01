import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseQueryParams, BaseResult, PaginationDto } from 'src/domain/dtos';
import { FarmedFishDocument, FarmedFishs } from 'src/domain/schemas';
import { GetSystemConfig } from '../system/queries/get.systemconfig';
import { FarmedFishContractDto } from './dtos';

@Injectable()
export class FishSeedCompanyService {
  constructor(
    @InjectModel(FarmedFishs.name)
    private readonly farmedFishModel: Model<FarmedFishDocument>,
    private readonly queryBus: QueryBus,
  ) {}

  async createFarmedFishContract(farmedFishContractDto: FarmedFishContractDto) {
    const result = new BaseResult();
    const systemconfig = await this.queryBus.execute(new GetSystemConfig());
    if (!systemconfig) {
      throw new NotFoundException('System config not found');
    }

    farmedFishContractDto.registrationContract =
      systemconfig.registrationContract;

    result.data = await this.farmedFishModel.create({
      ...farmedFishContractDto,
    });

    return result;
  }

  async getFarmedFishContracts(param: BaseQueryParams) {
    const result = new BaseResult();
    const { search, page, size, orderBy, desc } = param;
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
          numberOfFishSeedsAvailable: { $regex: search, $options: 'i' },
        },
        {
          aquacultureWaterType: { $regex: search, $options: 'i' },
        },
      ];
    }

    let sorter = {};
    if (orderBy) {
      switch (orderBy.toLowerCase()) {
        case 'speciesName':
          sorter = desc
            ? { name: 'desc', _id: 'desc' }
            : { name: 'asc', _id: 'asc' };
          break;
        case 'geographicOrigin':
          sorter = desc
            ? { tokenId: 'desc', _id: 'desc' }
            : { tokenId: 'asc', _id: 'asc' };
          break;
        case 'numberOfFishSeedsAvailable':
          sorter = desc
            ? { tokenId: 'desc', _id: 'desc' }
            : { tokenId: 'asc', _id: 'asc' };
          break;
        case 'aquacultureWaterType':
          sorter = desc
            ? { tokenId: 'desc', _id: 'desc' }
            : { tokenId: 'asc', _id: 'asc' };
          break;
        default:
          sorter = desc
            ? { createdAt: 'desc', _id: 'desc' }
            : { createdAt: 'asc', _id: 'asc' };
          break;
      }
    }
    const items = await this.farmedFishModel
      .find(query)
      .sort(sorter)
      .skip(skipIndex)
      .limit(size);
    const total = await this.farmedFishModel.countDocuments(query);

    result.data = new PaginationDto<FarmedFishs>(items, total, page, size);
    return result;
  }
}
