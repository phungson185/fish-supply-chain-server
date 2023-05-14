import { ApiProperty } from '@nestjs/swagger';
import { BaseQueryParams } from 'src/domain/dtos';

export class QueryOrderParams extends BaseQueryParams {
  @ApiProperty()
  status: number;

  @ApiProperty()
  orderer: string;

  @ApiProperty()
  receiver: string;
}
