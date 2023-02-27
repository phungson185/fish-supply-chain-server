import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Batchs,
  BatchSchema,
  Distributors,
  DistributorSchema,
  FishProcessors,
  FishProcessorSchema,
  Retailers,
  RetailerSchema,
  Users,
  UserSchema,
} from 'src/domain/schemas';
import { RetailerController } from './retailer.controller';
import { RetailerService } from './retailer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Distributors.name, schema: DistributorSchema },
      { name: FishProcessors.name, schema: FishProcessorSchema },
      { name: Users.name, schema: UserSchema },
      { name: Batchs.name, schema: BatchSchema },
      { name: Retailers.name, schema: RetailerSchema },
    ]),
  ],
  controllers: [RetailerController],
  providers: [RetailerService],
  exports: [RetailerService],
})
export class RetailerModule {}
