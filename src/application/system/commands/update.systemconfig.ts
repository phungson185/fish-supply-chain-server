import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseResult } from '../../../domain/dtos';
import { SystemConfigDto } from '../dtos';
import { SystemConfig, SystemConfigDocument } from '../../../domain/schemas';

export class UpdateSystemConfig {
  constructor(public id: string, public payload: SystemConfigDto) {}
}

@CommandHandler(UpdateSystemConfig)
export class UpdateSystemConfigHandler
  implements ICommandHandler<UpdateSystemConfig> {
    constructor(
      @InjectModel(SystemConfig.name)
      private readonly systemConfigModel: Model<SystemConfigDocument>
    ) {}

    async execute(command: UpdateSystemConfig): Promise<BaseResult<boolean>> {
      const result = new BaseResult<boolean>();
      try {     
        const systemConfig = await this.systemConfigModel.findOne({ _id: command.id });
        if(!systemConfig) {
          throw new BadRequestException(`"${command.id}", id is not exist`);     
        }

        const contract = command.payload.nftContractAddress;
        const item = await this.systemConfigModel.findOne({ _id: { $ne: command.id }, nftContractAddress: contract });
        if(item) {
          throw new BadRequestException(`"${contract}", chainName is existed!`);   
        } 

        await this.systemConfigModel.findOneAndUpdate({ _id: command.id }, command.payload);
        result.data = true;
        return result;
      }
      catch(error) {
        throw new NotFoundException('unown error');
      }
    }
}
