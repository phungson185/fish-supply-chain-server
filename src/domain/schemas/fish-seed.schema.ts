import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GeographicOrigin, MethodOfReproduction } from '../enum';

export type FishSeedDocument = FishSeed & Document;

@Schema({
  collection: 'fish-seed',
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
  images: string[];

  @AutoMap()
  @Prop()
  IPFSHash: string;
}

export const FishSeedSchema = SchemaFactory.createForClass(FishSeed);
