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
  @Prop({ default: null })
  email: string;

  @AutoMap()
  @Prop({ default: false })
  emailVerfied: boolean;

  @AutoMap()
  @Prop({ required: true })
  address: string;

  @AutoMap()
  @Prop({ default: 'https://picsum.photos/600/600' })
  avatar: string;

  @AutoMap()
  @Prop({ default: 'https://picsum.photos/1500/800' })
  cover: string;

  @AutoMap()
  @Prop({ default: 'Company name' })
  name: string;

  @AutoMap()
  @Prop()
  nonce: number;

  @AutoMap()
  @Prop({ default: 'Company bio' })
  bio: string;

  @AutoMap()
  @Prop({ default: 'Company phone' })
  phone: string;

  @AutoMap()
  @Prop({ default: 'Company address' })
  userAddress: string;

  @AutoMap()
  @Prop({ type: String, enum: RoleType, default: RoleType.Consumer })
  role: string;

  @AutoMap()
  @Prop({ default: true })
  active: boolean;
}

export const UserSchema = SchemaFactory.createForClass(Users);
