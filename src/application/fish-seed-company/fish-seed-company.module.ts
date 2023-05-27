import { HttpService, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Batchs,
  BatchSchema,
  FarmedFishs,
  FarmedFishSchema,
  FishSeed,
  FishSeedSchema,
  Log,
  LogSchema,
  Users,
  UserSchema,
} from 'src/domain/schemas';
import { FishSeedCompanyController } from './fish-seed-company.controller';
import { FishSeedCompanyService } from './fish-seed-company.service';
import { ConfigModule } from '@nestjs/config';
import { appConfiguration } from 'src/config/configuration';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: FarmedFishs.name, schema: FarmedFishSchema },
      { name: Batchs.name, schema: BatchSchema },
      { name: Users.name, schema: UserSchema },
      { name: FishSeed.name, schema: FishSeedSchema },
      { name: Log.name, schema: LogSchema },
    ]),
  ],
  controllers: [FishSeedCompanyController],
  providers: [FishSeedCompanyService],
  exports: [FishSeedCompanyService],
})
export class FishSeedCompanyModule {}
