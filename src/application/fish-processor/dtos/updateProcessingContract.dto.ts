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
}
