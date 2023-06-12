import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Interval } from '@nestjs/schedule';
import { Model } from 'mongoose';
import {
  DistributorDocument,
  Distributors,
  FishProcessing,
  FishProcessingDocument,
  RetailerDocument,
  Retailers,
} from 'src/domain/schemas';

@Injectable()
export class WorkerService {
  constructor(
    @InjectModel(FishProcessing.name)
    private readonly fishProcessingModel: Model<FishProcessingDocument>,
    @InjectModel(Distributors.name)
    private readonly distributorModel: Model<DistributorDocument>,
    @InjectModel(Retailers.name)
    private readonly retailerModel: Model<RetailerDocument>,
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
        contract.listing = false;
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
      console.log('End update status fish processing contract');

      // Update status distributor
      console.log('Start update status distributor');
      const distributors = await this.distributorModel.find({
        dateOfExpiry: { $lt: currentDate },
      });

      for (const distributor of distributors) {
        distributor.disable = true;
        distributor.listing = false;
        await distributor.save();
      }

      const activeDistributors = await this.distributorModel.find({
        dateOfExpiry: { $gte: currentDate },
      });

      for (const distributor of activeDistributors) {
        distributor.disable = false;
        await distributor.save();
      }
      console.log('End update status distributor');

      // Update status retailer
      console.log('Start update status retailer');
      const retailers = await this.retailerModel.find({
        dateOfExpiry: { $lt: currentDate },
      });

      for (const retailer of retailers) {
        retailer.disable = true;
        retailer.listing = false;
        await retailer.save();
      }

      const activeRetailers = await this.retailerModel.find({
        dateOfExpiry: { $gte: currentDate },
      });

      for (const retailer of activeRetailers) {
        retailer.disable = false;
        await retailer.save();
      }
      console.log('End update status retailer');
    } catch (error) {
      console.log(error);
    }
  }
}
