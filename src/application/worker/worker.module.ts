import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { WorkerService } from './worker.service';
import { FishProcessing, FishProcessingSchema } from 'src/domain/schemas';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      ttl: 0,
    }),
    MongooseModule.forFeature([
      { name: FishProcessing.name, schema: FishProcessingSchema },
    ]),
  ],
  providers: [WorkerService],
})
export class WorkerModule {}
