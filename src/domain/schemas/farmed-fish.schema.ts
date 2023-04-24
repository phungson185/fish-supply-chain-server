import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Users } from './user.schema';
import { GeographicOrigin, MethodOfReproduction } from '../enum';

export type FarmedFishDocument = FarmedFishs & Document;

@Schema({
  collection: 'farmed-fishs',
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
export class FarmedFishs {
  @AutoMap()
  @Prop()
  farmedFishContract: string;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  owner: Users;

  @AutoMap()
  @Prop()
  registrationContract: string;

  @AutoMap()
  @Prop()
  speciesName: string;

  @AutoMap()
  @Prop()
  numberOfFishSeedsAvailable: number;

  @AutoMap()
  @Prop()
  images: string[];

  @AutoMap()
  @Prop()
  waterTemperature: number;

  @AutoMap()
  @Prop()
  IPFSHash: string;

  @AutoMap()
  @Prop({ enum: GeographicOrigin })
  geographicOrigin: number;

  @AutoMap()
  @Prop({ enum: MethodOfReproduction })
  methodOfReproduction: number;
}

export const FarmedFishSchema = SchemaFactory.createForClass(FarmedFishs);
