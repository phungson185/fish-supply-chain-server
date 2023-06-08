import { HttpService, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Batchs,
  BatchSchema,
  FarmedFishs,
  FarmedFishSchema,
  FishFarmers,
  FishFarmerSchema,
  FishSeed,
  FishSeedSchema,
  Log,
  LogSchema,
  Users,
  UserSchema,
} from 'src/domain/schemas';
import { FishSeedCompanyController } from './fish-seed-company.controller';
import { FishSeedCompanyService } from './fish-seed-company.service';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: FarmedFishs.name, schema: FarmedFishSchema },
      { name: Batchs.name, schema: BatchSchema },
      { name: Users.name, schema: UserSchema },
      { name: FishSeed.name, schema: FishSeedSchema },
      { name: FishFarmers.name, schema: FishFarmerSchema },
      { name: Log.name, schema: LogSchema },
    ]),
  ],
  controllers: [FishSeedCompanyController],
  providers: [FishSeedCompanyService],
  exports: [FishSeedCompanyService],
})
export class FishSeedCompanyModule {}
