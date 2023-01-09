import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  address: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  cover: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  bio: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  userAddress: string;
}
