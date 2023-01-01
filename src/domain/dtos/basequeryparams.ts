import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
export class BaseQueryParams {
  @ApiProperty({ required: false, nullable: true })
  search: string;
  @ApiProperty({ required: false })
  page: number = 1;
  @ApiProperty({ required: false })
  size: number = 10;
  @ApiProperty({ required: false, nullable: true })
  orderBy: string;

  @ApiProperty({ required: false, nullable: true })
  @Transform((value) => [true, 'true', 1].indexOf(value.obj[value.key]) > -1)
  desc: boolean = false;
  skipIndex = this.size * (this.page - 1);
}
