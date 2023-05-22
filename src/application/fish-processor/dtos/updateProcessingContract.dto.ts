import { ApiProperty } from '@nestjs/swagger';
import { CreateProcessingContractDto } from './createProcessingContract.dto';
import { Transform } from 'class-transformer';

export class UpdateProcessingContractDto extends CreateProcessingContractDto {
  @ApiProperty()
  transactionHash: string;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  status: number;

  @ApiProperty()
  listing: boolean;

  @ApiProperty()
  processedSpeciesName: string;

  @ApiProperty()
  IPFSHash: string;

  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  dateOfProcessing: number;

  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  dateOfExpiry: number;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  filletsInPacket: number;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  numberOfPackets: number;

  @ApiProperty()
  image: string;

  @ApiProperty()
  description: string;
}
