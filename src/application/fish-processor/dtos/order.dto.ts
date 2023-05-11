import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class OrderDto {
  @ApiProperty()
  fishFarmerId: string;

  @ApiProperty()
  @Transform(({ value }) => value.toLowerCase())
  farmedFishPurchaser: string;

  @ApiProperty()
  @Transform(({ value }) => value.toLowerCase())
  farmedFishPurchaseOrderID: string;

  @ApiProperty()
  @Transform(({ value }) => value.toLowerCase())
  farmedFishSeller: string;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  numberOfFishOrdered: number;

  @ApiProperty()
  speciesName: string;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  geographicOrigin: number;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  methodOfReproduction: number;

  @ApiProperty()
  IPFSHash: string;

  @ApiProperty()
  image: string;
}
