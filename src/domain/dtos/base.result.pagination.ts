import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from './paginationdto';

export class BaseResultPagination<T> {
  @ApiProperty()
  errors: Record<string, string[]>;
  @ApiProperty()
  data: PaginationDto<T>;
  @ApiProperty()
  success: boolean = true;
}
