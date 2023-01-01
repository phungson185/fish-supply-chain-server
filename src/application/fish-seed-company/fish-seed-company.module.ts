import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { FarmedFishs, FarmedFishSchema } from 'src/domain/schemas';
import { FishSeedCompanyController } from './fish-seed-company.controller';
import { FishSeedCompanyService } from './fish-seed-company.service';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: FarmedFishs.name, schema: FarmedFishSchema },
    ]),
  ],
  controllers: [FishSeedCompanyController],
  providers: [FishSeedCompanyService],
  exports: [FishSeedCompanyService],
})
export class FishSeedCompanyModule {}