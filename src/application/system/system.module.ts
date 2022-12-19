import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemConfig, SystemConfigSchema } from '../../domain/schemas';
// import { SystemMapper } from './mapper/system.mapper';
import { QueryHandlers } from './queries';
import { SystemController } from './system.controller';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: SystemConfig.name, schema: SystemConfigSchema },
    ]),
  ],
  controllers: [SystemController],
  providers: [...QueryHandlers],
})
export class SystemModule {}
