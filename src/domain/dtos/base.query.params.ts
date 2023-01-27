import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Max, Min } from 'class-validator';
export class BaseQueryParams {
  @ApiProperty({ required: false, nullable: true })
  search: string;

  @ApiProperty({ required: false })
  @Transform((value) => parseInt(value.obj[value.key], 10))
  page: number = 1;

  @ApiProperty({ required: false })
  @Transform((value) => parseInt(value.obj[value.key], 10))
  size: number = 10;

  @ApiProperty({ required: false, nullable: true })
  orderBy: string;

  @ApiProperty({ required: false, nullable: true })
  @Transform((value) => [true, 'true', 1].indexOf(value.obj[value.key]) > -1)
  desc: boolean = false;
  skipIndex = this.size * (this.page - 1);
}
