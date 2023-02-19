import { ApiProperty } from '@nestjs/swagger';

export class UpdateGrowthDetailsDto {
  @ApiProperty()
  totalNumberOfFish: number;

  @ApiProperty()
  fishWeight: number;

  @ApiProperty()
  speciesName: string;

  @ApiProperty()
  IPFSHash: string;
}
