import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseResult, PaginationDto } from 'src/domain/dtos';
import { BatchDocument, Batchs } from 'src/domain/schemas';
import { BatchQueryDto } from './dtos/batch.query,dto';

@Injectable()
export class BatchService {
  constructor(
    @InjectModel(Batchs.name)
    private readonly batchModel: Model<BatchDocument>,
  ) {}

  async getBatchs(queries: BatchQueryDto) {
    const result = new BaseResult();
    const { search, page, size, orderBy, desc, batchStep, batchType } = queries;
    const skipIndex = size * (page - 1);
    const query: FilterQuery<BatchDocument> = {};
    console.log(batchStep, batchType);
    if (batchType === 0) {
      query.lastChainPoint = { $exists: true };
    } else if (batchType === 1) {
      query.lastChainPoint = { $in: ['farmedFishId', 'fishFarmerId'] };
    } else if (batchType === 2) {
      query.lastChainPoint = {
        $in: ['fishProcessingId', 'distributorId', 'retailerId'],
      };
    }

    if (batchStep === 1) {
      query.lastChainPoint = 'farmedFishId';
    } else if (batchStep === 2) {
      query.lastChainPoint = 'fishFarmerId';
    } else if (batchStep === 3) {
      query.lastChainPoint = 'fishProcessingId';
    } else if (batchStep === 4) {
      query.lastChainPoint = 'distributorId';
    } else if (batchStep === 5) {
      query.lastChainPoint = 'retailerId';
    }

    console.log(query);

    const items = await this.batchModel
      .find(query)
      .populate({
        path: 'farmedFishId',
        populate: {
          path: 'owner',
        },
      })
      .populate({
        path: 'fishFarmerId',
        populate: [
          {
            path: 'fishSeedsPurchaser',
          },
          {
            path: 'fishSeedsSeller',
          },
          {
            path: 'owner',
          },
          {
            path: 'updater',
          },
        ],
      })
      .populate({
        path: 'fishProcessingId',
        populate: [
          {
            path: 'fishProcessorId',
          },
          {
            path: 'fishProcessor',
          },
          {
            path: 'owner',
          },
        ],
      })
      .populate({
        path: 'distributorId',
        populate: [
          {
            path: 'owner',
          },
          {
            path: 'fishProcessingId',
          },
        ],
      })
      .populate({
        path: 'retailerId',
        populate: [
          {
            path: 'owner',
          },
        ],
      })
      .find({})
      .sort({ updatedAt: 'desc', _id: 'desc' })
      .skip(skipIndex)
      .limit(size);
    const total = await this.batchModel.countDocuments(query);

    result.data = new PaginationDto<Batchs>(items, total, page, size);
    return result;
  }

  async getBatch(id: string) {
    const result = new BaseResult();
    const item = await this.batchModel
      .findById(id)
      .populate({
        path: 'farmedFishId',
        populate: {
          path: 'owner',
        },
      })
      .populate({
        path: 'fishFarmerId',
        populate: [
          {
            path: 'fishSeedsPurchaser',
          },
          {
            path: 'fishSeedsSeller',
          },
          {
            path: 'owner',
          },
          {
            path: 'updater',
          },
        ],
      })
      .populate({
        path: 'fishProcessingId',
        populate: [
          {
            path: 'fishProcessorId',
          },
          {
            path: 'fishProcessor',
          },
          {
            path: 'owner',
          },
        ],
      })
      .populate({
        path: 'distributorId',
        populate: [
          {
            path: 'owner',
          },
          {
            path: 'fishProcessingId',
          },
        ],
      })
      .populate({
        path: 'retailerId',
        populate: [
          {
            path: 'owner',
          },
        ],
      });

    if (!item) {
      throw new NotFoundException('Batch not found');
    }

    result.data = item;
    return result;
  }
}
