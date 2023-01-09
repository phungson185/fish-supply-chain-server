import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseResult } from 'src/domain/dtos';
import { UserDocument, Users } from 'src/domain/schemas';
import { UpdateProfileDto } from './dtos';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(Users.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async updateProfile(updateProfileDto: UpdateProfileDto) {
    const result = new BaseResult();
    const { address, avatar, cover, email, bio, phone, userAddress, name } =
      updateProfileDto;

    const user = await this.userModel.findOne({ address }).exec();
    if (!user) {
      throw new NotFoundException('User is not found');
    }

    if (email) {
      const duplicatedUser = await this.userModel.findOne({ email }).exec();
      if (
        duplicatedUser &&
        duplicatedUser._id.toString() !== user._id.toString()
      ) {
        throw new BadRequestException('Email is used by other account');
      }
    }

    // let avatarLink = null;
    // if (avatar) {
    //   avatarLink = await this.uploadService.upload(avatar);
    //   user.avatar = avatarLink;
    // }

    // let coverLink = null;
    // if (cover) {
    //   Logger.log(`upload cover of user: ${user._id}`);
    //   coverLink = await this.uploadService.upload(cover);
    //   user.cover = coverLink;
    // }

    const newInfo = Object.assign(new UpdateProfileDto(), {
      email,
      avatar,
      cover,
      bio,
      phone,
      userAddress,
      name
    });

    const newUser = await this.userModel
      .findOneAndUpdate({ address }, { $set: newInfo }, { new: true })
      .exec();
    result.data = newUser;
    return result;
  }
}
