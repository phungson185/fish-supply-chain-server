import { ApiProperty } from '@nestjs/swagger';
import { BaseQueryParams } from 'src/domain/dtos';

export class QueryProcessingContractDto extends BaseQueryParams {
  @ApiProperty()
  fishProcessor: string;
}
