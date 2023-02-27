import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Batchs,
  BatchSchema,
  Distributors,
  DistributorSchema,
  FishProcessors,
  FishProcessorSchema,
  Users,
  UserSchema,
} from 'src/domain/schemas';
import { DistributorController } from './distributor.controller';
import { DistributorService } from './distributor.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Distributors.name, schema: DistributorSchema },
      { name: FishProcessors.name, schema: FishProcessorSchema },
      { name: Users.name, schema: UserSchema },
      { name: Batchs.name, schema: BatchSchema },
    ]),
  ],
  controllers: [DistributorController],
  providers: [DistributorService],
  exports: [DistributorService],
})
export class DistributorModule {}
