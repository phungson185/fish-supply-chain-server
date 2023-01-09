import { Body, Controller, Put, Req, Res } from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
import { HttpStatus } from '@nestjs/common/enums';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dtos';
import { UserService } from './user.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@Controller('user')
@ApiTags('UserEndpoints')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
}
