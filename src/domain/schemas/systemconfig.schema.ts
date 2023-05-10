import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SystemConfigDocument = SystemConfig & Document;

@Schema({
  collection: 'system-config',
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
export class SystemConfig {
  @AutoMap()
  @Prop()
  registrationContract: string;
}

export const SystemConfigSchema = SchemaFactory.createForClass(SystemConfig);
