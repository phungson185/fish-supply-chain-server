import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Batchs,
  BatchSchema,
  FarmedFishs,
  FarmedFishSchema,
} from 'src/domain/schemas';
import { BatchController } from './batch..controller';
import { BatchService } from './batch.service';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: FarmedFishs.name, schema: FarmedFishSchema },
      { name: Batchs.name, schema: BatchSchema },
    ]),
  ],
  controllers: [BatchController],
  providers: [BatchService],
})
export class BatchModule {}
