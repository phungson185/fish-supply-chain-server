import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GetNonceDto, GetTokenDto } from './dtos';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('AuthEndpoints')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('authentication/nonce')
  async getNonce(@Query() query: GetNonceDto): Promise<any> {
    const user = await this.authService.getUserByAddress(query.address);
    return {
      success: true,
      data: { address: query.address, nonce: user.nonce },
      errors: [],
    };
  }

  @Post('authentication/token')
  async getToken(@Body() tokenDto: GetTokenDto): Promise<any> {
    const accessToken = await this.authService.generateToken(tokenDto);
    return {
      success: true,
      data: { accessToken },
      errors: [],
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req, @Response() res) {
    return res
      .status(HttpStatus.OK)
      .json({ data: req.user, success: true, errors: [] });
  }
}
