import { ApiProperty } from '@nestjs/swagger';

export class BaseResult<T> {
  @ApiProperty()
  errors: Record<string, string[]>;
  @ApiProperty()
  data: T;
  @ApiProperty()
  success: boolean = true;
}
