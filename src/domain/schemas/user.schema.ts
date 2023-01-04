import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RoleType } from '../enum';

export type UserDocument = Users & Document;

@Schema({
  collection: 'users',
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
export class Users {
  @AutoMap()
  @Prop()
  email: string;

  @AutoMap()
  @Prop({ default: false })
  emailVerfied: boolean;

  @AutoMap()
  @Prop({ required: true })
  address: string;

  @AutoMap()
  @Prop()
  avatar: string;

  @AutoMap()
  @Prop()
  cover: string;

  @AutoMap()
  @Prop()
  name: string;

  @AutoMap()
  @Prop()
  nonce: number;

  @AutoMap()
  @Prop()
  bio: string;

  @AutoMap()
  @Prop()
  phone: string;

  @AutoMap()
  @Prop()
  userAddress: string;

  @AutoMap()
  @Prop({ type: String, enum: RoleType, default: RoleType.Consumer })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(Users);
