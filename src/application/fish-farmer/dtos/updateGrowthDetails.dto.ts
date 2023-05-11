import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateGrowthDetailsDto {
  @ApiProperty()
  transactionHash: number;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  totalNumberOfFish: number;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  fishWeight: number;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  waterTemperature: number;

  @ApiProperty()
  IPFSHash: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  orderable: boolean;

  @ApiProperty()
  farmedFishGrowthDetailsID: string;
}
