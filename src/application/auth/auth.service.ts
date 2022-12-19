import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { bufferToHex } from 'ethereumjs-utils';
import { recoverPersonalSignature } from 'eth-sig-util';
import { JwtService } from '@nestjs/jwt';

import { Users, UserDocument } from '../../domain/schemas';
import { GetTokenDto } from './dtos';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users.name) private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async getUserByAddress(address: string): Promise<Users> {
    const user = await this.userModel.findOne({ address }).exec();
    if (user) {
      return user;
    }
    const newUser = new this.userModel({
      nonce: Math.floor(Math.random() * 1000000),
      address,
      username: address,
    });
    await newUser.save();
    return newUser;
  }

  verifySignature({
    user,
    signature,
  }: {
    user: any;
    signature: string;
  }): boolean {
    const msg = `${user.nonce}`;
    const msgBufferHex = bufferToHex(Buffer.from(msg, 'utf8'));
    const address = recoverPersonalSignature({
      data: msgBufferHex,
      sig: signature,
    });
    return address.toLowerCase() === user.address.toLowerCase();
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async generateToken(tokenDto: GetTokenDto): Promise<string | null> {
    const user = await this.userModel
      .findOne({ address: tokenDto.address })
      .exec();
    const isVerified = this.verifySignature({
      user,
      signature: tokenDto.signature,
    });

    if (isVerified) {
      const payload = {
        address: tokenDto.address,
        sub: user._id.toString(),
      };
      // update new nonce
      user.nonce = Math.floor(Math.random() * 1000000);
      console.log(`generate new nonce: ${user.nonce}`);
      // generate token
      const accessToken = this.jwtService.sign(payload);
      return accessToken;
    }
    return null;
  }
}
