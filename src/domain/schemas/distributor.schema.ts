import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { ProcessStatus } from '../enum';
import { FishProcessors } from './fish-processor.schema';
import { Users } from './user.schema';
import { FishProcessing } from './fish-processing.schema';

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
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'FishProcessing' })
  fishProcessingId: FishProcessing;

  @AutoMap()
  @Prop()
  speciesName: string;

  @AutoMap()
  @Prop()
  description: string;

  @AutoMap()
  @Prop()
  quantityOfFishPackageOrdered: number;

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

  @AutoMap()
  @Prop()
  dateOfProcessing: Date;

  @AutoMap()
  @Prop()
  dateOfExpiry: Date;

  @AutoMap()
  @Prop()
  numberOfPackets: number;

  @AutoMap()
  @Prop()
  filletsInPacket: number;

  @AutoMap()
  @Prop()
  IPFSHash: string;

  @AutoMap()
  @Prop()
  image: string;
}

export const DistributorSchema = SchemaFactory.createForClass(Distributors);
