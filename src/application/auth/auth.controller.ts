import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Request,
  Res,
  Response,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GetNonceDto, GetTokenDto, SyncRoleDto } from './dtos';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('AuthEndpoints')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('authentication/nonce')
  async getNonce(
    @Res() res,
    @Req() req,
    @Query() query: GetNonceDto,
  ): Promise<any> {
    try {
      const user = await this.authService.getUserByAddress(query.address);
      return res.status(HttpStatus.OK).json(user);
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
  }

  @Post('authentication/token')
  async getToken(
    @Res() res,
    @Req() req,
    @Body() tokenDto: GetTokenDto,
  ): Promise<any> {
    try {
      const accessToken = await this.authService.generateToken(tokenDto);
      return res.status(HttpStatus.OK).json(accessToken);
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Post('authentication/sync-role')
  async syncRole(@Res() res, @Req() req, @Body() syncRoleDto: SyncRoleDto): Promise<any> {
    syncRoleDto.address = req.user.address;
    try {
      const user = await this.authService.syncRole(syncRoleDto);
      return res.status(HttpStatus.OK).json(user);
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
  }
}
