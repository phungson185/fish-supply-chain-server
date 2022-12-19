import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseResult } from '../../../domain/dtos';
import { SystemConfigDto } from '../dtos';
import { SystemConfig, SystemConfigDocument } from '../../../domain/schemas';

export class CreateSystemConfig {
  constructor(public payload: SystemConfigDto) {}
}

@CommandHandler(CreateSystemConfig)
export class CreateSystemConfigHandler
  implements ICommandHandler<CreateSystemConfig> {
    constructor(
      @InjectModel(SystemConfig.name) 
      private readonly systemConfigModel: Model<SystemConfigDocument>,
    ) {}

    async execute(command: CreateSystemConfig): Promise<BaseResult<string>> {
      const result = new BaseResult<string>();
      try {
        const contract = command.payload.nftContractAddress;
        const item = await this.systemConfigModel.findOne({ contract: contract });
        if(item) {
          throw new BadRequestException(`"${contract}", contract is existed`);    
        }
        const newSystemConfig = new this.systemConfigModel(command.payload);
        const systemConfig = await this.systemConfigModel.create(newSystemConfig);
        result.data = systemConfig._id;
        return result;
      }
      catch(error) {
        throw new NotFoundException('unown error');
      }
    }
}
