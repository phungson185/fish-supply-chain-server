import { Body, Controller, Put, Req, Res, Post } from '@nestjs/common';
import { Get, Query, UseGuards } from '@nestjs/common/decorators';
import { HttpStatus } from '@nestjs/common/enums';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseQueryParams, BaseResult } from 'src/domain/dtos';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto, UpdateUserDto } from './dtos';
import { UserService } from './user.service';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { RoleType } from 'src/domain/enum';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@Controller('user')
@ApiTags('UserEndpoints')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getProfile(@Res() res, @Req() req) {
    const result = new BaseResult();
    result.data = req.user;
    return res.status(HttpStatus.OK).json(result);
  }

  @Put()
  async updateProfile(
    @Res() res,
    @Req() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    updateProfileDto.address = req.user.address;
    try {
      const user = await this.userService.updateProfile(updateProfileDto);
      return res.status(HttpStatus.OK).json(user);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json(err);
    }
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.FDA)
  @Get('/all-users')
  async getUsers(@Res() res, @Req() req, @Query() queries: BaseQueryParams) {
    try {
      const result = await this.userService.getUsers(queries);
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json(err);
    }
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.FDA)
  @Post('/update-user')
  async updateUser(
    @Res() res,
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const result = await this.userService.updateUser(updateUserDto);
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json(err);
    }
  }
}
