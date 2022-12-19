import { QueryBus, CommandBus } from '@nestjs/cqrs';
import {
  Controller,
  Get,
  Post,
  Res,
  Body,
  Put,
  Param,
  Delete,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiExtraModels,
  ApiOkResponse,
  ApiCreatedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { SystemConfigDto } from './dtos';
import { BaseResult } from '../../domain/dtos';
import { GetSystemConfig } from './queries/get.systemconfig';
import { CreateSystemConfig } from './commands/create.systemconfig';
import { UpdateSystemConfig } from './commands/update.systemconfig';
import { DeleteSystemConfig } from './commands/delete.systemconfig';

@Controller('system')
@ApiTags('SystemEndpoints')
@ApiExtraModels(BaseResult, SystemConfigDto)
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
