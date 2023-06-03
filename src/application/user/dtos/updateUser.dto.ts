import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  active: boolean;
}
