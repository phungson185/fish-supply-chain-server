import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { BatchType } from '../enum';
import { FarmedFishs } from './farmed-fish.schema';
import { Users } from './user.schema';

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
  @Prop({ required: true })
  batchContract: string;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'FarmedFishs', default: null })
  farmedFishId: FarmedFishs;

  @AutoMap()
  @Prop({ type: Number, enum: BatchType, required: true })
  type: number;
}

export const BatchSchema = SchemaFactory.createForClass(Batchs);
