import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfiguration, InjectAppConfig } from '../../config/configuration';
import { UserDocument, Users } from '../../domain/schemas';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(Users.name) private readonly userModel: Model<UserDocument>,
    @InjectAppConfig() private appConfiguration: AppConfiguration,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfiguration.jwt.secret,
    });
  }

  async validate(payload: any): Promise<Users> {
    const { address } = payload;
    const user = await this.userModel.findOne({ address: address }).exec();
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
