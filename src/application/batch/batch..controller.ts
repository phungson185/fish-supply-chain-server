import {
  Controller,
  UseGuards,
  Get,
  Res,
  HttpStatus,
  Req,
  Query,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseQueryParams } from 'src/domain/dtos';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BatchService } from './batch.service';
import { BatchQueryDto } from './dtos/batch.query,dto';

@Controller('batchs')
@ApiTags('BatchEndpoints')
export class BatchController {
  constructor(private batchService: BatchService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Get()
  public async GetBatchs(
    @Res() res,
    @Req() req,
    @Query() queries: BatchQueryDto,
  ) {
    try {
      const result = await this.batchService.getBatchs(queries);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Get(':id')
  public async GetBatch(@Res() res, @Req() req, @Param('id') id: string) {
    try {
      const result = await this.batchService.getBatch(id);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }
}
