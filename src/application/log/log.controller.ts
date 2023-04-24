import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LogService } from './log.service';
import { BaseQueryParams } from 'src/domain/dtos';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@Controller('logs')
@ApiTags('LogEndpoints')
export class LogController {
  constructor(private logSerive: LogService) {}

  @Get()
  public async GetLogs(
    @Res() res,
    @Req() req,
    @Query() queries: BaseQueryParams,
  ) {
    try {
      const result = await this.logSerive.getLogs(req.user._id, queries);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json(error);
    }
  }
}
