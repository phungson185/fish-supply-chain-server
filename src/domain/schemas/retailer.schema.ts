import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { ProcessStatus } from '../enum';
import { Distributors } from './distributor.schema';
import { FishProcessors } from './fish-processor.schema';
import { Users } from './user.schema';

export type RetailerDocument = Retailers & Document;

@Schema({
  collection: 'retailers',
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
export class Retailers {
  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Distributors' })
  distributorId: Distributors;

  @AutoMap()
  @Prop()
  retailerPurchaseOrderID: string;

  @AutoMap()
  @Prop()
  processedFishPurchaseOrderID: string;

  @AutoMap()
  @Prop()
  numberOfFishPackagesOrdered: number;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  buyer: Users;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  seller: Users;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  owner: Users;

  @AutoMap()
  @Prop({ enum: ProcessStatus, default: ProcessStatus.Pending })
  status: number;
}

export const RetailerSchema = SchemaFactory.createForClass(Retailers);
