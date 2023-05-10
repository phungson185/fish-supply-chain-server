import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateGrowthDetailsDto {
  @ApiProperty()
  transactionHash: number;

  @ApiProperty()
  totalNumberOfFish: number;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  fishWeight: number;

  @ApiProperty()
  waterTemperature: number;

  @ApiProperty()
  IPFSHash: string;

  @ApiProperty()
  image: string;
}
