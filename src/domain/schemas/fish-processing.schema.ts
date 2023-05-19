import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { FishProcessors } from './fish-processor.schema';
import { Users } from './user.schema';

export type FishProcessingDocument = FishProcessing & Document;

@Schema({
  collection: 'fish-processings',
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
export class FishProcessing {
  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'FishProcessors' })
  fishProcessorId: FishProcessors;

  @AutoMap()
  @Prop()
  processedSpeciesName: string;

  @AutoMap()
  @Prop()
  description: string;

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
  dateOfExpiry: Date;

  @AutoMap()
  @Prop()
  farmedFishPurchaseOrderID: string;

  @AutoMap()
  @Prop()
  filletsInPacket: number;

  @AutoMap()
  @Prop()
  numberOfPackets: number;

  @AutoMap()
  @Prop()
  processingContract: string;

  @AutoMap()
  @Prop()
  image: string;

  @AutoMap()
  @Prop({ default: false })
  disable: boolean;

  @AutoMap()
  @Prop({ default: false })
  listing: boolean;
}

export const FishProcessingSchema =
  SchemaFactory.createForClass(FishProcessing);
