import { ApiProperty } from '@nestjs/swagger';
import { BaseQueryParams } from 'src/domain/dtos';
import { BatchType } from 'src/domain/enum';

export class BatchQueryDto extends BaseQueryParams {
  @ApiProperty()
  type: number;
}
