import { ApiProperty } from '@nestjs/swagger';

export class UpdateFarmedFishContractDto {
  @ApiProperty()
  transactionHash: string;

  @ApiProperty()
  speciesName: string;

  @ApiProperty()
  geographicOrigin: number;

  @ApiProperty()
  numberOfFishSeedsAvailable: number;

  @ApiProperty()
  methodOfReproduction: number;

  @ApiProperty()
  images: string;

  @ApiProperty()
  waterTemperature: number;

  @ApiProperty()
  IPFSHash: string;
}