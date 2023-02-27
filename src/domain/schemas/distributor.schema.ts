import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { ProcessStatus } from '../enum';
import { FishProcessors } from './fish-processor.schema';
import { Users } from './user.schema';

export type DistributorDocument = Distributors & Document;

@Schema({
  collection: 'distributors',
  timestamps: true,
  toJSON: {
    transform: function (doc, ret, options) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Distributors {
  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'FishProcessors' })
  processorId: FishProcessors;

  @AutoMap()
  @Prop()
  quantityOfFishPackageOrdered: number;

  @AutoMap()
  @Prop()
  processedFishPackageId: string;

  @AutoMap()
  @Prop()
  processedFishPurchaseOrderId: string;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  orderer: Users;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  receiver: Users;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  owner: Users;

  @AutoMap()
  @Prop({ enum: ProcessStatus, default: ProcessStatus.Pending })
  status: number;
}

export const DistributorSchema = SchemaFactory.createForClass(Distributors);
