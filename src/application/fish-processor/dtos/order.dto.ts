import { ApiProperty } from '@nestjs/swagger';

export class OrderDto {
  @ApiProperty()
  fishFarmerId: string;

  @ApiProperty()
  farmedFishPurchaser: string;

  @ApiProperty()
  farmedFishSeller: string;

  @ApiProperty()
  speciesName: string;

  @ApiProperty()
  numberOfFishOrdered: number;

  @ApiProperty()
  farmedFishPurchaseOrderID: string;
}
