import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { appConfiguration, AppConfiguration } from '../../config/configuration';
import { Users, UserSchema } from '../../domain/schemas';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (appConfiguration: AppConfiguration) => ({
        secret: appConfiguration.jwt.secret,
        signOptions: {
          expiresIn: appConfiguration.jwt.signOptions,
        },
      }),
      inject: [appConfiguration.KEY],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([{ name: Users.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
