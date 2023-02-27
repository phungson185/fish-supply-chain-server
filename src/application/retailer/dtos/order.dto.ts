import { ApiProperty } from '@nestjs/swagger';

export class OrderDto {
  @ApiProperty()
  buyer: string;

  @ApiProperty()
  seller: string;

  @ApiProperty()
  retailerPurchaseOrderID: string;

  @ApiProperty()
  numberOfFishPackagesOrdered: number;
  
  @ApiProperty()
  processedFishPurchaseOrderID: string;

  @ApiProperty()
  distributorId: string;
}
