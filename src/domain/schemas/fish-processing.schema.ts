import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Users } from './user.schema';

export type FishProcessingDocument = FishProcessings & Document;

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
export class FishProcessings {
  @AutoMap()
  @Prop()
  registrationContract: string;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  fishProcessor: Users;

  @AutoMap()
  @Prop()
  speciesName: string;

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

export const FishProcessingSchema =
  SchemaFactory.createForClass(FishProcessings);
