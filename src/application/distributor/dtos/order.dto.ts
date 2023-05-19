import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class OrderDto {
  @ApiProperty()
  fishProcessingId: string;

  @ApiProperty()
  speciesName: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  quantityOfFishPackageOrdered: number;

  @ApiProperty()
  processedFishPurchaseOrderId: string;

  @ApiProperty()
  orderer: string;

  @ApiProperty()
  receiver: string;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  status: number;

  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  dateOfProcessing: Date;

  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  dateOfExpiry: Date;

  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  filletsInPacket: number;

  @ApiProperty()
  IPFSHash: string;

  @ApiProperty()
  image: string;
}
