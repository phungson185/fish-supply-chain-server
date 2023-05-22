import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class OrderDto {
  @ApiProperty()
  buyer: string;

  @ApiProperty()
  seller: string;

  @ApiProperty()
  retailerPurchaseOrderID: string;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  numberOfFishPackagesOrdered: number;

  @ApiProperty()
  processedFishPurchaseOrderID: string;

  @ApiProperty()
  distributorId: string;

  @ApiProperty()
  speciesName: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  dateOfProcessing: Date;

  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  dateOfExpiry: Date;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  numberOfPackets: number;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  filletsInPacket: number;

  @ApiProperty()
  IPFSHash: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  disable: boolean;

  @ApiProperty()
  listing: boolean;

  @ApiProperty()
  transactionHash: string;
}
