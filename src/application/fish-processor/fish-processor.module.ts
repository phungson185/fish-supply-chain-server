import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Batchs,
  BatchSchema,
  Distributors,
  DistributorSchema,
  FishFarmers,
  FishFarmerSchema,
  FishProcessing,
  FishProcessingSchema,
  FishProcessors,
  FishProcessorSchema,
  Log,
  LogSchema,
  Users,
  UserSchema,
} from 'src/domain/schemas';
import { FishProcessorController } from './fish-processor.controller';
import { FishProcessorService } from './fish-processor.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FishProcessors.name, schema: FishProcessorSchema },
      { name: FishProcessing.name, schema: FishProcessingSchema },
      { name: FishFarmers.name, schema: FishFarmerSchema },
      { name: Distributors.name, schema: DistributorSchema },
      { name: Users.name, schema: UserSchema },
      { name: Batchs.name, schema: BatchSchema },
      { name: Log.name, schema: LogSchema },
    ]),
  ],
  controllers: [FishProcessorController],
  providers: [FishProcessorService],
  exports: [FishProcessorService],
})
export class FishProcessorModule {}
