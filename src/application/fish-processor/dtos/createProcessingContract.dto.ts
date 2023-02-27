import { ApiProperty } from '@nestjs/swagger';

export class CreateProcessingContractDto {
  @ApiProperty()
  orderId: string;

  @ApiProperty()
  registrationContract: string;

  @ApiProperty()
  fishProcessor: string;

  @ApiProperty()
  IPFSHash: string;

  @ApiProperty()
  dateOfProcessing: number;

  @ApiProperty()
  catchMethod: string;

  @ApiProperty()
  filletsInPacket: number;

  @ApiProperty()
  processingContract: string;
}
