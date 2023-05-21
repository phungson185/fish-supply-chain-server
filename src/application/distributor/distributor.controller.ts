import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
  UseGuards,
  Param,
  Put,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseQueryParams } from 'src/domain/dtos';
import { RoleType } from 'src/domain/enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/role.decorator';
import { RolesGuard } from '../auth/role.guard';
import { DistributorService } from './distributor.service';
import {
  ConfirmOrderDto,
  OrderDto,
  QueryOrderParams,
  UpdateOrderDto,
} from './dtos';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
@Controller('distributor')
@ApiTags('DistributorEndpoints')
export class DistributorController {
  constructor(private distributorSerive: DistributorService) {}

  @Roles(RoleType.Distributor, RoleType.FishProcessor)
  @Post('order')
  public async CreateOrder(@Res() res, @Body() orderDto: OrderDto) {
    try {
      const result = await this.distributorSerive.createOrder(orderDto);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.Distributor, RoleType.FishProcessor, RoleType.Retailer)
  @Get('orders')
  public async GetOrders(@Res() res, @Query() queries: QueryOrderParams) {
    try {
      const result = await this.distributorSerive.getOrders(queries);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.Distributor, RoleType.FishProcessor)
  @Put('/orders/:orderId/confirm')
  public async ConfirmOrder(
    @Res() res,
    @Param('orderId') orderId: string,
    @Body() confirmOrderDto: ConfirmOrderDto,
  ) {
    try {
      const result = await this.distributorSerive.confirmOrder(
        orderId,
        confirmOrderDto,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.Distributor, RoleType.Retailer)
  @Put('/orders/:orderId/update')
  public async UpdateOrder(
    @Res() res,
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    try {
      const result = await this.distributorSerive.updateOrder(
        orderId,
        updateOrderDto,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.Distributor, RoleType.Retailer)
  @Get('/get-profile-inventory/:id')
  public async GetProfileInventory(
    @Res() res,
    @Req() req,
    @Param('id') id: string,
  ) {
    try {
      const result = await this.distributorSerive.getProfileInventory(
        id ?? req.user.id,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }
}
