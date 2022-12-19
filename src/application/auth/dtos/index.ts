import { ApiProperty } from '@nestjs/swagger';

export class GetNonceDto {
  @ApiProperty({ required: true, nullable: false })
  address: string;
}

export class GetTokenDto {
  @ApiProperty({ required: true, nullable: false })
  address: string;

  @ApiProperty({ required: true, nullable: false })
  signature: string;
}
