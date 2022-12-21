import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/domain/enum';

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

export class SyncRoleDto {
  address: string;

  @ApiProperty({ required: true, nullable: false, enum: Role })
  role: string;
}