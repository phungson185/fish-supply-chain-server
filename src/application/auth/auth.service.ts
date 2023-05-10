import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { recoverPersonalSignature } from 'eth-sig-util';
import { bufferToHex } from 'ethereumjs-utils';
import { Model } from 'mongoose';
import { BaseResult } from 'src/domain/dtos';

import { UserDocument, Users } from '../../domain/schemas';
import { GetTokenDto, SyncRoleDto } from './dtos';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users.name) private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async getUserByAddress(address: string) {
    const result = new BaseResult();

    const user = await this.userModel.findOne({ address }).exec();
    if (user) {
      result.data = user;
      return result;
    }
    const newUser = new this.userModel({
      nonce: Math.floor(Math.random() * 1000000),
      address,
    });
    await newUser.save();
    result.data = newUser;
    return result;
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

  async generateToken(tokenDto: GetTokenDto) {
    const result = new BaseResult();
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
      user.nonce = Math.floor(Math.random() * 1000000);
      const accessToken = this.jwtService.sign(payload);
      result.data = {
        accessToken,
        id: user._id,
      };
      return result;
    }
    return null;
  }

  async syncRole(syncRoleDto: SyncRoleDto) {
    const { address, role } = syncRoleDto;
    const result = new BaseResult();
    const user = await this.userModel.findOne({ address }).exec();
    if (user.role !== role) {
      user.role = role;
      await user.save();
      result.data = user;
      return result;
    }
    result.data = user;
    return result;
  }
}
