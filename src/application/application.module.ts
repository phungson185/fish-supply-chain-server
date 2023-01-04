import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { FishSeedCompanyModule } from './fish-seed-company/fish-seed-company.module';
import { SystemModule } from './system/system.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AuthModule,
    SystemModule,
    FishSeedCompanyModule,
    UserModule
  ],
})
export class ApplicationModule {}
