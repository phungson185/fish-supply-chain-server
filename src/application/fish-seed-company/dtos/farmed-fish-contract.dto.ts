import { ApiProperty } from '@nestjs/swagger';

export class FarmedFishContractDto {
  @ApiProperty()
  farmedFishContract: string;

  @ApiProperty()
  speciesName: string;

  @ApiProperty()
  geographicOrigin: string;

  @ApiProperty()
  numberOfFishSeedsAvailable: string;

  @ApiProperty()
  aquacultureWaterType: string;

  @ApiProperty()
  IPFSHash: string;

  owner: string;
  registrationContract: string;
}
