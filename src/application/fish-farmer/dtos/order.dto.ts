import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class OrderDto {
  @ApiProperty()
  farmedFishId: string;

  @ApiProperty()
  fishSeedPurchaseOrderId: string;

  @ApiProperty()
  fishSeedsPurchaser: string;

  @ApiProperty()
  fishSeedsSeller: string;

  @ApiProperty()
  numberOfFishSeedsOrdered: number;

  @ApiProperty()
  @Transform(({ value }) => new Number(value))
  fishSeedsPurchaseOrderDetailsStatus: number;

  @ApiProperty()
  transactionHash: string;
}
