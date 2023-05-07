import { ApiProperty } from '@nestjs/swagger';
import { BaseQueryParams } from 'src/domain/dtos';
import { TransactionType } from 'src/domain/enum';

export class LogsQueryParamDto extends BaseQueryParams {
  @ApiProperty()
  objectId: string;

  @ApiProperty({ enum: TransactionType })
  transactionType: number;
}
