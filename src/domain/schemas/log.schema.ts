import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { GeographicOrigin } from '../enum';
import { Users } from './user.schema';
import { TransactionType } from '../enum/transactionType';

export type LogDocument = Log & Document;

@Schema({
  collection: 'log',
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
export class Log {
  @AutoMap()
  @Prop()
  objectId: string;

  @AutoMap()
  @Prop()
  transactionHash: string;

  @AutoMap()
  @Prop({ enum: TransactionType })
  transactionType: number;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  owner: Users;

  @AutoMap()
  @Prop()
  oldData: string;

  @AutoMap()
  @Prop()
  newData: string;

  @AutoMap()
  @Prop()
  title: string;

  @AutoMap()
  @Prop()
  message: string;

  @AutoMap()
  @Prop({ enum: TransactionType })
  logType: number;
}

export const LogSchema = SchemaFactory.createForClass(Log);
