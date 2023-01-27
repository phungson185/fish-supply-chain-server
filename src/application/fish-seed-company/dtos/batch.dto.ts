import { ApiProperty } from '@nestjs/swagger';
import { BatchType } from 'src/domain/enum';

export class BatchDto {
  @ApiProperty({ required: true })
  farmedFishId: string;

  @ApiProperty({ enum: BatchType, required: true })
  type: number;
}
