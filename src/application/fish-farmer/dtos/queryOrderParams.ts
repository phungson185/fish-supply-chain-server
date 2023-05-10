import { ApiProperty } from '@nestjs/swagger';
import { BaseQueryParams } from 'src/domain/dtos';

export class QueryOrderParams extends BaseQueryParams {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fishSeedsPurchaseOrderDetailsStatus: number;

  @ApiProperty()
  fishSeedsSeller: string;

  @ApiProperty()
  fishSeedsPurchaser: string;
}
