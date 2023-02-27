import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  Get,
  Query,
  Put,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseQueryParams } from 'src/domain/dtos';
import { RoleType } from 'src/domain/enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/role.decorator';
import { RolesGuard } from '../auth/role.guard';
import {
  ConfirmOrderDto,
  CreateProcessingContractDto,
  OrderDto,
  QueryOrderParams,
} from './dtos';
import { FishProcessorService } from './fish-processor.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
@Controller('fishprocessor')
@ApiTags('FishProcessorEndpoints')
export class FishProcessorController {
  constructor(private fishProcessorService: FishProcessorService) {}

  @Roles(RoleType.FishProcessor)
  @Post('orders')
  public async CreateOrder(@Res() res, @Body() orderDto: OrderDto) {
    try {
      const result = await this.fishProcessorService.createOrder(orderDto);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.FishFarmer, RoleType.FishProcessor)
  @Get('orders')
  public async GetOrders(@Res() res, @Query() queries: QueryOrderParams) {
    try {
      const result = await this.fishProcessorService.getOrders(queries);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.FishFarmer, RoleType.FishProcessor)
  @Put('/orders/:orderId/confirm')
  public async ConfirmOrder(
    @Res() res,
    @Param('orderId') orderId: string,
    @Body() body: ConfirmOrderDto,
  ) {
    try {
      const result = await this.fishProcessorService.confirmOrder(
        orderId,
        body,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.FishProcessor)
  @Post('/createProcessingContract')
  public async CreateProcessingContract(
    @Res() res,
    @Body() body: CreateProcessingContractDto,
  ) {
    try {
      const result = await this.fishProcessorService.createProcessingContract(
        body,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }
}
