import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Batchs,
  BatchSchema,
  FarmedFishs,
  FarmedFishSchema,
  FishFarmers,
  FishFarmerSchema,
  FishProcessors,
  FishProcessorSchema,
  Log,
  LogSchema,
  Users,
  UserSchema,
} from 'src/domain/schemas';
import { FishFarmerController } from './fish-farmer.controller';
import { FishFarmerService } from './fish-farmer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FishFarmers.name, schema: FishFarmerSchema },
      { name: Users.name, schema: UserSchema },
      { name: FarmedFishs.name, schema: FarmedFishSchema },
      { name: FishProcessors.name, schema: FishProcessorSchema },
      { name: Batchs.name, schema: BatchSchema },
      { name: Log.name, schema: LogSchema },
    ]),
  ],
  controllers: [FishFarmerController],
  providers: [FishFarmerService],
  exports: [FishFarmerService],
})
export class FishFarmerModule {}
