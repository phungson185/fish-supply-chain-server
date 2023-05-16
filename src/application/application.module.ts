import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BatchModule } from './batch/batch.module';
import { DistributorModule } from './distributor/distributor.module';
import { FishFarmerModule } from './fish-farmer/fish-farmer.module';
import { FishProcessorModule } from './fish-processor/fish-processor.module';
import { FishSeedCompanyModule } from './fish-seed-company/fish-seed-company.module';
import { RetailerModule } from './retailer/retailer.module';
import { SystemModule } from './system/system.module';
import { UserModule } from './user/user.module';
import { LogModule } from './log/log.module';
import { WorkerModule } from './worker/worker.module';

@Module({
  imports: [
    AuthModule,
    SystemModule,
    FishSeedCompanyModule,
    UserModule,
    BatchModule,
    FishFarmerModule,
    FishProcessorModule,
    DistributorModule,
    RetailerModule,
    LogModule,
    WorkerModule,
  ],
})
export class ApplicationModule {}
