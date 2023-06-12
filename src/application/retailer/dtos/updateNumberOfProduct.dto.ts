import { ApiProperty } from '@nestjs/swagger';

export class UpdateNumberOfProductDto {
  @ApiProperty()
  orderId: string;

  @ApiProperty()
  quantity: number;
}
