import { IQuery , IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseResult } from '../../../domain/dtos';
import { SystemConfigDto } from '../dtos';
import { SystemConfig, SystemConfigDocument } from '../../../domain/schemas';

export class GetSystemConfig 
  implements IQuery {}

@QueryHandler(GetSystemConfig)
export class GetSystemConfigHandler 
  implements IQueryHandler<GetSystemConfig> {
    constructor(
      @InjectModel(SystemConfig.name) 
      private readonly systemConfigModel: Model<SystemConfigDocument>,

    ) {}

    async execute(): Promise<BaseResult<SystemConfigDto>> {
      const result = new BaseResult<SystemConfigDto>();
      const systemConfig = await this.systemConfigModel.findOne({});
      result.data = systemConfig
      return result;    
    }
}
