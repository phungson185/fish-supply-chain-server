import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { ProcessStatus } from '../enum/processStatus';
import { FarmedFishs } from './farmed-fish.schema';
import { Users } from './user.schema';

export type FishFarmerDocument = FishFarmers & Document;

@Schema({
  collection: 'fish-farmers',
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
export class FishFarmers {
  @AutoMap()
  @Prop()
  fishSeedPurchaseOrderId: string;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'FarmedFishs' })
  farmedFishId: FarmedFishs;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  fishSeedsPurchaser: Users;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  fishSeedsSeller: Users;

  @AutoMap()
  @Prop()
  numberOfFishSeedsOrdered: number;

  @AutoMap()
  @Prop({ enum: ProcessStatus, default: ProcessStatus.Pending })
  fishSeedsPurchaseOrderDetailsStatus: number;

  @AutoMap()
  @Prop()
  totalNumberOfFish: number;

  @AutoMap()
  @Prop()
  fishWeight: number;

  @AutoMap()
  @Prop()
  speciesName: string;

  @AutoMap()
  @Prop()
  IPFSHash: string;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  updater: Users;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  owner: Users;
}

export const FishFarmerSchema = SchemaFactory.createForClass(FishFarmers);
