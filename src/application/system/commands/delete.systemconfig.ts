import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseResult } from '../../../domain/dtos';
import { SystemConfig, SystemConfigDocument } from '../../../domain/schemas';

export class DeleteSystemConfig {
  constructor(public id: string) {}
}

@CommandHandler(DeleteSystemConfig)
export class DeleteSystemConfigHandler
  implements ICommandHandler<DeleteSystemConfig> {
    constructor(
      @InjectModel(SystemConfig.name) 
      private readonly systemConfigModel: Model<SystemConfigDocument>,
    ) {}

    async execute(command: DeleteSystemConfig): Promise<BaseResult<boolean>> {
      const result = new BaseResult<boolean>();
      try {
        const item = await this.systemConfigModel.findOne({ _id: command.id });
        if(!item) {
          throw new BadRequestException(`"${command.id}", id is not exist`);       
        }

        await this.systemConfigModel.deleteOne({ _id: command.id });
        result.data = true;
        return result;
      }
      catch(error) {
        throw new NotFoundException('unown error');
      }
    }
}
