import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LogService } from './log.service';
import { LogsQueryParamDto } from './dtos/logsQueryParam.dto';

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
    @Query() queries: LogsQueryParamDto,
  ) {
    try {
      const result = await this.logSerive.getLogs(req.user._id, queries);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }
}
