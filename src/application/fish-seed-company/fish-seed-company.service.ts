import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseQueryParams, BaseResult, PaginationDto } from 'src/domain/dtos';
import {
  BatchDocument,
  Batchs,
  FarmedFishDocument,
  FarmedFishs,
} from 'src/domain/schemas';
import { GetSystemConfig } from '../system/queries/get.systemconfig';
import { FarmedFishContractDto } from './dtos';
import { BatchDto } from './dtos/batch.dto';
import { UpdateFarmedFishContractDto } from './dtos/update-farmed-fish-contract.dto';

@Injectable()
export class FishSeedCompanyService {
  constructor(
    @InjectModel(FarmedFishs.name)
    private readonly farmedFishModel: Model<FarmedFishDocument>,
    @InjectModel(Batchs.name)
    private readonly batchModel: Model<BatchDocument>,
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

  async getFarmedFishContracts(queries: BaseQueryParams) {
    const result = new BaseResult();
    const { search, page, size, orderBy, desc } = queries;
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
          aquacultureWaterType: { $regex: search, $options: 'i' },
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
        case 'numberOfFishSeedsAvailable':
          sorter = desc
            ? { numberOfFishSeedsAvailable: 'desc', _id: 'desc' }
            : { numberOfFishSeedsAvailable: 'asc', _id: 'asc' };
          break;
        case 'aquacultureWaterType':
          sorter = desc
            ? { aquacultureWaterType: 'desc', _id: 'desc' }
            : { aquacultureWaterType: 'asc', _id: 'asc' };
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
      .populate('owner')
      .sort(sorter)
      .skip(skipIndex)
      .limit(size);
    const total = await this.farmedFishModel.countDocuments(query);

    result.data = new PaginationDto<FarmedFishs>(items, total, page, size);
    return result;
  }

  async createBatch(batchDto: BatchDto) {
    const result = new BaseResult();

    result.data = await this.batchModel.create({
      ...batchDto,
    });

    return result;
  }

  async updateFarmedFishContract(
    updateFarmedFishContractDto: UpdateFarmedFishContractDto,
  ) {
    const result = new BaseResult();
    const { address, available } = updateFarmedFishContractDto;

    result.data = await this.farmedFishModel.findOneAndUpdate(
      { address },
      {
        $set: {
          available,
        },
      },
      { new: true },
    );

    return result;
  }
}
