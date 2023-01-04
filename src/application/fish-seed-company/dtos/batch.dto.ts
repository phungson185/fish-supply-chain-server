import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { BatchType } from 'src/domain/enum';

export class BatchDto {
  @ApiProperty({ required: true })
  @Transform(({ value }) => value.toLowerCase())
  batchContract: string;

  @ApiProperty({ required: true })
  farmedFishId: string;

  @ApiProperty({ enum: BatchType, required: true })
  type: number;
}
