import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseQueryParams, BaseResult, PaginationDto } from 'src/domain/dtos';
import { Log, LogDocument } from 'src/domain/schemas';
import { LogsQueryParamDto } from './dtos/logsQueryParam.dto';

@Injectable()
export class LogService {
  constructor(
    @InjectModel(Log.name)
    private readonly logModel: Model<LogDocument>,
  ) {}

  async getLogs(userId: string, logsQueryParamDto: LogsQueryParamDto) {
    const result = new BaseResult();
    const { search, page, size, orderBy, desc, objectId } = logsQueryParamDto;
    const skipIndex = size * (page - 1);
    const query: FilterQuery<LogDocument> = {};
    query.owner = userId;
    if (objectId) query.objectId = objectId;
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

    // let sorter = { createdAt: 'desc', _id: 'desc' };
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
    const items = await this.logModel
      .find(query)
      .populate('owner')
      .sort({ createdAt: 'desc', _id: 'desc' })
      .skip(skipIndex)
      .limit(size);
    const total = await this.logModel.countDocuments(query);

    result.data = new PaginationDto<Log>(items, total, page, size);
    return result;
  }
}
