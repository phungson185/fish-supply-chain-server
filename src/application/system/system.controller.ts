import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { BaseResult } from '../../domain/dtos';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSystemConfig } from './commands/create.systemconfig';
import { DeleteSystemConfig } from './commands/delete.systemconfig';
import { UpdateSystemConfig } from './commands/update.systemconfig';
import { SystemConfigDto } from './dtos';
import { GetSystemConfig } from './queries/get.systemconfig';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@Controller('system')
@ApiTags('SystemEndpoints')
export class SystemController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiCreatedResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(BaseResult) },
        {
          properties: {
            data: { type: 'string' },
          },
        },
      ],
    },
  })
  public async CreateSystemConfig(
    @Res() res,
    @Query() CreateDto: SystemConfigDto,
  ) {
    const result = await this.commandBus.execute(
      new CreateSystemConfig(CreateDto),
    );
    return res.status(HttpStatus.OK).json(result);
  }

  @Get()
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(BaseResult) },
        {
          properties: {
            data: { $ref: getSchemaPath(SystemConfigDto) },
          },
        },
      ],
    },
  })
  public async GetSystemConfig(@Res() res) {
    const result = await this.queryBus.execute(new GetSystemConfig());
    return res.status(HttpStatus.OK).json(result);
  }

  @Put(':id')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(BaseResult) },
        {
          properties: {
            data: { type: 'boolean' },
          },
        },
      ],
    },
  })
  public async UpdateSystemConfig(
    @Res() res,
    @Param('id') systemConfigId: string,
    @Query() updateDto: SystemConfigDto,
  ) {
    const result = await this.commandBus.execute(
      new UpdateSystemConfig(systemConfigId, updateDto),
    );
    return res.status(HttpStatus.OK).json(result);
  }

  @Delete(':id')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(BaseResult) },
        {
          properties: {
            data: { type: 'boolean' },
          },
        },
      ],
    },
  })
  public async DeleteSystemConfig(
    @Res() res,
    @Param('id') systemConfigId: string,
  ) {
    const result = await this.commandBus.execute(
      new DeleteSystemConfig(systemConfigId),
    );
    return res.status(HttpStatus.OK).json(result);
  }
}
