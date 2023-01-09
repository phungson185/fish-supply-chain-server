import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class FarmedFishContractDto {
  @ApiProperty()
  @Transform(({ value }) => value.toLowerCase())
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
