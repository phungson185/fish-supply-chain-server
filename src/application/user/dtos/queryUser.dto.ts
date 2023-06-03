import { ApiProperty } from '@nestjs/swagger';
import { BaseQueryParams } from 'src/domain/dtos';

export class QueryUserDto extends BaseQueryParams {
  @ApiProperty()
  address: string;
}
