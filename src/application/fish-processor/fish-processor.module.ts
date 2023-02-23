import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Batchs,
  BatchSchema,
  FishFarmers,
  FishFarmerSchema,
  FishProcessors,
  FishProcessorSchema,
  Users,
  UserSchema,
} from 'src/domain/schemas';
import { FishProcessorController } from './fish-processor.controller';
import { FishProcessorService } from './fish-processor.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FishProcessors.name, schema: FishProcessorSchema },
      { name: FishFarmers.name, schema: FishFarmerSchema },
      { name: Users.name, schema: UserSchema },
      { name: Batchs.name, schema: BatchSchema },
    ]),
  ],
  controllers: [FishProcessorController],
  providers: [FishProcessorService],
  exports: [FishProcessorService],
})
export class FishProcessorModule {}
