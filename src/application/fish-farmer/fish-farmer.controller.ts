import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseQueryParams } from 'src/domain/dtos';
import { RoleType } from 'src/domain/enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/role.decorator';
import { RolesGuard } from '../auth/role.guard';
import { OrderDto } from './dtos/order.dto';
import { FishFarmerService } from './fish-farmer.service';


@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
@Controller('fishfarmer')
@ApiTags('FishFarmerEndpoints')
export class FishFarmerController {
  constructor(private fishFarmerService: FishFarmerService) {}

  @Roles(RoleType.FishFarmer)
  @Post('order')
  public async CreateOrder(@Res() res, @Body() orderDto: OrderDto) {
    try {
      const result = await this.fishFarmerService.createOrder(orderDto);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.FishFarmer, RoleType.FishSeedCompany)
  @Get('orders')
  public async GetOrders(@Res() res, @Query() queries: BaseQueryParams) {
    try {
      const result = await this.fishFarmerService.getOrders(queries);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }
}