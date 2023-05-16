import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Interval } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { FishProcessing, FishProcessingDocument } from 'src/domain/schemas';

@Injectable()
export class WorkerService {
  constructor(
    @InjectModel(FishProcessing.name)
    private readonly fishProcessingModel: Model<FishProcessingDocument>,
  ) {}

  @Interval(24 * 60 * 60 * 1000) // Runs once every day (24 hours)
  // @Interval(10000) // Runs once every 10s
  async updateStatusFishProcessingContract() {
    try {
      console.log('Start update status fish processing contract');
      const currentDate = new Date();
      const fishProcessingContracts = await this.fishProcessingModel.find({
        dateOfExpiry: { $lt: currentDate },
      });

      for (const contract of fishProcessingContracts) {
        contract.disable = true;
        await contract.save();
      }

      const activeFishProcessingContracts = await this.fishProcessingModel.find(
        {
          dateOfExpiry: { $gte: currentDate },
        },
      );

      for (const contract of activeFishProcessingContracts) {
        contract.disable = false;
        await contract.save();
      }
    } catch (error) {
      console.log(error);
    }
  }
}
