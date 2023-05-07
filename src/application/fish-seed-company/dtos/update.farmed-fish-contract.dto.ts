import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFarmedFishContractDto {
  @Optional()
  @ApiProperty()
  transactionHash: string;

  @Optional()
  @ApiProperty()
  speciesName: string;

  @Optional()
  @ApiProperty()
  geographicOrigin: number;

  @Optional()
  @ApiProperty()
  numberOfFishSeedsAvailable: number;

  @Optional()
  @ApiProperty()
  methodOfReproduction: number;

  @Optional()
  @ApiProperty()
  image: string;

  @Optional()
  @ApiProperty()
  waterTemperature: number;

  @Optional()
  @ApiProperty()
  IPFSHash: string;
}
