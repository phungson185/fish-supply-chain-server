import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseResult, PaginationDto } from 'src/domain/dtos';
import { UserDocument, Users } from 'src/domain/schemas';
import { UpdateProfileDto, UpdateUserDto } from './dtos';

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
      name,
    });

    const newUser = await this.userModel
      .findOneAndUpdate({ address }, { $set: newInfo }, { new: true })
      .exec();
    result.data = newUser;
    return result;
  }

  async getUsers(queries) {
    const result = new BaseResult();
    const { search, page, size, orderBy = 'updatedAt', desc = true } = queries;
    const skipIndex = size * (page - 1);
    const query: FilterQuery<UserDocument> = {};

    query.role = { $ne: 'FDA' };

    if (search) {
      query.$or = [
        {
          address: { $regex: search, $options: 'i' },
        },
        {
          name: { $regex: search, $options: 'i' },
        },
        {
          bio: { $regex: search, $options: 'i' },
        },
        {
          phone: { $regex: search, $options: 'i' },
        },
        {
          userAddress: { $regex: search, $options: 'i' },
        },
        {
          role: { $regex: search, $options: 'i' },
        },
      ];
    }

    let sorter = {};
    if (orderBy) {
      switch (orderBy) {
        case 'name':
          sorter = desc
            ? { name: 'desc', _id: 'desc' }
            : { name: 'asc', _id: 'asc' };
          break;
        case 'userAddress':
          sorter = desc
            ? { userAddress: 'desc', _id: 'desc' }
            : { userAddress: 'asc', _id: 'asc' };
          break;
        case 'role':
          sorter = desc
            ? { role: 'desc', _id: 'desc' }
            : { role: 'asc', _id: 'asc' };
          break;
        case 'updatedAt':
          sorter = desc
            ? { updatedAt: 'desc', _id: 'desc' }
            : { updatedAt: 'asc', _id: 'asc' };
        default:
          sorter = desc
            ? { createdAt: 'desc', _id: 'desc' }
            : { createdAt: 'asc', _id: 'asc' };
          break;
      }
    }
    const items = await this.userModel
      .find(query)
      .sort(sorter)
      .skip(skipIndex)
      .limit(size);
    const total = await this.userModel.countDocuments(query);

    result.data = new PaginationDto<Users>(items, total, page, size);
    return result;
  }

  async updateUser(updateUserDto: UpdateUserDto) {
    const result = new BaseResult();
    const { active, userId } = updateUserDto;

    result.data = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: { active } },
      { new: true },
    );

    return result;
  }
}
