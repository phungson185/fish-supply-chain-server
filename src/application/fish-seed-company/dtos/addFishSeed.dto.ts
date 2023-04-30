import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class AddFishSeedDto {
  @AutoMap()
  @ApiProperty()
  geographicOrigin: number;

  @AutoMap()
  @ApiProperty()
  title: string;

  @AutoMap()
  @ApiProperty()
  subTitle: string;

  @AutoMap()
  @ApiProperty()
  description: string;

  @AutoMap()
  @ApiProperty()
  methodOfReproduction: number;

  @AutoMap()
  @ApiProperty()
  speciesName: string;

  @AutoMap()
  @ApiProperty()
  quantity: number;

  @AutoMap()
  @ApiProperty()
  waterTemperature: number;

  @AutoMap()
  @ApiProperty()
  image: string;

  @AutoMap()
  @ApiProperty()
  IPFSHash: string;
}
