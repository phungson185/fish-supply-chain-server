import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Batchs,
  BatchSchema,
  Distributors,
  DistributorSchema,
  FishProcessing,
  FishProcessingSchema,
  FishProcessors,
  FishProcessorSchema,
  Log,
  LogSchema,
  Retailers,
  RetailerSchema,
  Users,
  UserSchema,
} from 'src/domain/schemas';
import { DistributorController } from './distributor.controller';
import { DistributorService } from './distributor.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Distributors.name, schema: DistributorSchema },
      { name: FishProcessing.name, schema: FishProcessingSchema },
      { name: FishProcessors.name, schema: FishProcessorSchema },
      { name: Retailers.name, schema: RetailerSchema },
      { name: Users.name, schema: UserSchema },
      { name: Batchs.name, schema: BatchSchema },
      { name: Log.name, schema: LogSchema },
    ]),
  ],
  controllers: [DistributorController],
  providers: [DistributorService],
  exports: [DistributorService],
})
export class DistributorModule {}
