import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Users } from './user.schema';

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
  geographicOrigin: string;

  @AutoMap()
  @Prop()
  numberOfFishSeedsAvailable: number;

  @AutoMap()
  @Prop()
  aquacultureWaterType: string;

  @AutoMap()
  @Prop()
  IPFSHash: string;
}

export const FarmedFishSchema = SchemaFactory.createForClass(FarmedFishs);
