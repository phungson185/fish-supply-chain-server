import { ApiProperty } from '@nestjs/swagger';

export class ConfirmOrderDto {
  @ApiProperty()
  status: number;

  @ApiProperty()
  numberOfFishSeedsAvailable: number;
}
