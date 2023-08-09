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
  speciesName: string;

  @AutoMap()
  @Prop()
  description: string;

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

  @AutoMap()
  @Prop({ default: false })
  disable: boolean;

  @AutoMap()
  @Prop({ default: false })
  listing: boolean;

  @AutoMap()
  @Prop()
  transactionHash: string;

  @AutoMap()
  @Prop()
  qrCode: string;
}

export const RetailerSchema = SchemaFactory.createForClass(Retailers);
