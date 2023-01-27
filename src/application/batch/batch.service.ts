import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseResult, PaginationDto } from 'src/domain/dtos';
import { BatchDocument, Batchs } from 'src/domain/schemas';
import { BatchQueryDto } from './dtos/batch.query,dto';

@Injectable()
export class BatchService {
  constructor(
    @InjectModel(Batchs.name)
    private readonly batchModel: Model<BatchDocument>,
  ) {}

  async getBatchs(queries: BatchQueryDto) {
    const result = new BaseResult();
    const { search, page, size, orderBy, desc, type } = queries;
    const skipIndex = size * (page - 1);
    const query: FilterQuery<BatchDocument> = {};
    // if (search) {
    //   query.$or = [
    //     {
    //       farmedFishContract: { $regex: search, $options: 'i' },
    //     },
    //     {
    //       speciesName: { $regex: search, $options: 'i' },
    //     },
    //     {
    //       geographicOrigin: { $regex: search, $options: 'i' },
    //     },
    //     {
    //       aquacultureWaterType: { $regex: search, $options: 'i' },
    //     },
    //   ];
    // }

    let sorter = {};
    // if (orderBy) {
    //   switch (orderBy) {
    //     case 'speciesName':
    //       sorter = desc
    //         ? { speciesName: 'desc', _id: 'desc' }
    //         : { speciesName: 'asc', _id: 'asc' };
    //       break;
    //     case 'geographicOrigin':
    //       sorter = desc
    //         ? { geographicOrigin: 'desc', _id: 'desc' }
    //         : { geographicOrigin: 'asc', _id: 'asc' };
    //       break;
    //     case 'numberOfFishSeedsAvailable':
    //       sorter = desc
    //         ? { numberOfFishSeedsAvailable: 'desc', _id: 'desc' }
    //         : { numberOfFishSeedsAvailable: 'asc', _id: 'asc' };
    //       break;
    //     case 'aquacultureWaterType':
    //       sorter = desc
    //         ? { aquacultureWaterType: 'desc', _id: 'desc' }
    //         : { aquacultureWaterType: 'asc', _id: 'asc' };
    //       break;
    //     default:
    //       sorter = desc
    //         ? { createdAt: 'desc', _id: 'desc' }
    //         : { createdAt: 'asc', _id: 'asc' };
    //       break;
    //   }
    // }
    const items = await this.batchModel
      .find(query)
      .populate({
        path: 'farmedFishId',
        populate: {
          path: 'owner',
        },
      })
      .sort(sorter)
      .skip(skipIndex)
      .limit(size);
    const total = await this.batchModel.countDocuments(query);

    result.data = new PaginationDto<Batchs>(items, total, page, size);
    return result;
  }
}
