import { ApiProperty } from '@nestjs/swagger';
import { BaseQueryParams } from 'src/domain/dtos';

export class QueryProcessingContractDto extends BaseQueryParams {
  @ApiProperty()
  isHavePackets: boolean;

  @ApiProperty()
  fishProcessorId: string;

  @ApiProperty()
  fishProcessor: string;

  @ApiProperty()
  disable?: boolean;
}
