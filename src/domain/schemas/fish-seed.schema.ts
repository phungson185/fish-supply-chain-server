import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { GeographicOrigin, MethodOfReproduction } from '../enum';
import { Users } from './user.schema';

export type FishSeedDocument = FishSeed & Document;

@Schema({
  collection: 'fish-seeds',
  timestamps: true,
  toJSON: {
    transform: function (doc, ret, options) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    transform: function (doc, ret, options) {
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
      return ret;
    },
  },
})
export class FishSeed {
  @AutoMap()
  @Prop()
  title: string;

  @AutoMap()
  @Prop()
  subTitle: string;

  @AutoMap()
  @Prop()
  description: string;

  @AutoMap()
  @Prop({ enum: GeographicOrigin })
  geographicOrigin: number;

  @AutoMap()
  @Prop({ enum: MethodOfReproduction })
  methodOfReproduction: number;

  @AutoMap()
  @Prop()
  speciesName: string;

  @AutoMap()
  @Prop()
  quantity: number;

  @AutoMap()
  @Prop()
  waterTemperature: number;

  @AutoMap()
  @Prop()
  image: string;

  @AutoMap()
  @Prop()
  IPFSHash: string;

  @AutoMap()
  @Prop({ default: false })
  isMakeContract: boolean;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  owner: Users;
}

export const FishSeedSchema = SchemaFactory.createForClass(FishSeed);
