import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UserSchema } from '../../domain/schemas';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Users.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
