import { ApiProperty } from '@nestjs/swagger';

export class UpdateFarmedFishContractDto {
  @ApiProperty()
  address: string;

  @ApiProperty()
  available: boolean;
}
