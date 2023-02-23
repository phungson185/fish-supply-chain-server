import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { BatchType } from '../enum';
import { FarmedFishs } from './farmed-fish.schema';
import { FishFarmers } from './fish-farmer.schema';
import { FishProcessors } from './fish-processor.schema';

export type BatchDocument = Batchs & Document;

@Schema({
  collection: 'batchs',
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
export class Batchs {
  @AutoMap()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FarmedFishs',
    default: null,
  })
  farmedFishId: FarmedFishs;

  @AutoMap()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FishFarmers',
  })
  fishFarmerId: FishFarmers;

  @AutoMap()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FishProcessors',
  })
  fishProcessorId: FishProcessors;

  @AutoMap()
  @Prop({ type: Number, enum: BatchType, required: true })
  type: number;
}

export const BatchSchema = SchemaFactory.createForClass(Batchs);
