import { ApiProperty } from '@nestjs/swagger';

export class OrderDto {
  @ApiProperty()
  orderer: string;

  @ApiProperty()
  receiver: string;

  @ApiProperty()
  processedFishPackageId: string;

  @ApiProperty()
  quantityOfFishPackageOrdered: number;

  @ApiProperty()
  processorId: string;
  
  @ApiProperty()
  processedFishPurchaseOrderId: string;
}
