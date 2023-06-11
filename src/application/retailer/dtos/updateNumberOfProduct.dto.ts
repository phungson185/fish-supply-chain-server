import { ApiProperty } from '@nestjs/swagger';

export class UpdateNumberOfProductDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  quantity: number;
}
