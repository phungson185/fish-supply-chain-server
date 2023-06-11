import { ApiProperty } from '@nestjs/swagger';
import { BaseQueryParams } from 'src/domain/dtos';

export class QueryOrderParams extends BaseQueryParams {
  @ApiProperty()
  status: number;

  @ApiProperty()
  buyer: string;

  @ApiProperty()
  seller: string;

  @ApiProperty()
  disable: boolean;

  @ApiProperty()
  listing: boolean;

  @ApiProperty()
  isHavePackets: boolean;

  @ApiProperty()
  dateFilter: string;

  @ApiProperty()
  fromDate?: number;

  @ApiProperty()
  toDate?: number;
}
