import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class FarmedFishContractDto {
  @ApiProperty()
  @Transform(({ value }) => value.toLowerCase())
  farmedFishContract: string;

  @ApiProperty()
  fishSeedId: string;

  @ApiProperty()
  speciesName: string;

  @ApiProperty()
  geographicOrigin: number;

  @ApiProperty()
  numberOfFishSeedsAvailable: number;

  @ApiProperty()
  methodOfReproduction: number;

  @ApiProperty()
  image: string;

  @ApiProperty()
  waterTemperature: number;

  @ApiProperty()
  IPFSHash: string;

  owner: string;
  registrationContract: string;
}
