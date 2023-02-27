import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { ProcessStatus } from '../enum/processStatus';
import { FishFarmers } from './fish-farmer.schema';
import { Users } from './user.schema';

export type FishProcessorDocument = FishProcessors & Document;

@Schema({
  collection: 'fish-processors',
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
export class FishProcessors {
  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'FishFarmers' })
  fishFarmerId: FishFarmers;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  farmedFishPurchaser: Users;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  farmedFishSeller: Users;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  owner: Users;

  @AutoMap()
  @Prop()
  farmedFishPurchaseOrderID: string;

  @AutoMap()
  @Prop()
  speciesName: string;

  @AutoMap()
  @Prop()
  numberOfFishOrdered: number;

  @AutoMap()
  @Prop({ enum: ProcessStatus, default: ProcessStatus.Pending })
  status: number;

  @AutoMap()
  @Prop()
  registrationContract: string;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  fishProcessor: Users;

  @AutoMap()
  @Prop()
  IPFSHash: string;

  @AutoMap()
  @Prop()
  dateOfProcessing: Date;

  @AutoMap()
  @Prop()
  catchMethod: string;

  @AutoMap()
  @Prop()
  filletsInPacket: number;

  @AutoMap()
  @Prop()
  processingContract: string;
}

export const FishProcessorSchema = SchemaFactory.createForClass(FishProcessors);
