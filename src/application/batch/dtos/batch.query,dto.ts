import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { BaseQueryParams } from 'src/domain/dtos';
import { BatchType } from 'src/domain/enum';

export class BatchQueryDto extends BaseQueryParams {
  @ApiProperty()
  @Transform(({ value }) => value && parseInt(value))
  batchType: number;

  @ApiProperty()
  @Transform(({ value }) => value && parseInt(value))
  batchStep: number;
}
