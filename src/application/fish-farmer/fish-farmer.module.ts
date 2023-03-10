import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Batchs, BatchSchema, FarmedFishs, FarmedFishSchema, FishFarmers, FishFarmerSchema, Users, UserSchema } from 'src/domain/schemas';
import { FishFarmerController } from './fish-farmer.controller';
import { FishFarmerService } from './fish-farmer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FishFarmers.name, schema: FishFarmerSchema },
      { name: Users.name, schema: UserSchema },
      { name: FarmedFishs.name, schema: FarmedFishSchema },
      { name: Batchs.name, schema: BatchSchema },
    ]),
  ],
  controllers: [FishFarmerController],
  providers: [FishFarmerService],
  exports: [FishFarmerService],
})
export class FishFarmerModule {}
