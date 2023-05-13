import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateProcessingContractDto {
  @ApiProperty()
  fishProcessorId: string;

  @ApiProperty()
  processedSpeciesName: string;

  @ApiProperty()
  registrationContract: string;

  @ApiProperty()
  fishProcessor: string;

  @ApiProperty()
  IPFSHash: string;

  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  dateOfProcessing: number;

  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  dateOfExpiry: number;

  @ApiProperty()
  farmedFishPurchaseOrderID: string;

  @ApiProperty()
  processedFishPackageID: string;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  filletsInPacket: number;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  numberOfPackets: number;

  @ApiProperty()
  processingContract: string;

  @ApiProperty()
  image: string;
}
