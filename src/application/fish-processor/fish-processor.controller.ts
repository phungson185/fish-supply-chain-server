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
  Req,
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
  QueryProcessingContractDto,
  UpdateProcessingContractDto,
} from './dtos';
import { FishProcessorService } from './fish-processor.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
@Controller('fishprocessor')
@ApiTags('FishProcessorEndpoints')
export class FishProcessorController {
  constructor(private fishProcessorService: FishProcessorService) {}

  @Roles(RoleType.FishProcessor)
  @Post('order')
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
  @Post('/create-processing-contract')
  public async CreateProcessingContract(
    @Res() res,
    @Req() req,
    @Body() body: CreateProcessingContractDto,
  ) {
    try {
      const result = await this.fishProcessorService.createProcessingContract(
        req.user.id,
        body,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.FishProcessor, RoleType.Distributor)
  @Put('/processing-contract/:id')
  public async UpdateProcessingContract(
    @Res() res,
    @Param('id') id: string,
    @Body() body: UpdateProcessingContractDto,
  ) {
    try {
      const result = await this.fishProcessorService.updateProcessingContract(
        id,
        body,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.FishProcessor, RoleType.Distributor)
  @Get('/get-processing-contracts')
  public async GetProcessingContracts(
    @Res() res,
    @Req() req,
    @Query() queries: QueryProcessingContractDto,
  ) {
    try {
      const result = await this.fishProcessorService.getProcessingContracts(
        queries,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.FishProcessor)
  @Get('/get-processing-contract/:id')
  public async GetProcessingContract(@Res() res, @Param('id') id: string) {
    try {
      const result = await this.fishProcessorService.getProcessingContract(id);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.FishProcessor, RoleType.Distributor)
  @Get('/get-profile-inventory/:id')
  public async GetProfileInventory(
    @Res() res,
    @Req() req,
    @Param('id') id: string,
  ) {
    try {
      const result = await this.fishProcessorService.getProfileInventory(
        id ?? req.user.id,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.FishProcessor)
  @Get('summaryCommon')
  public async GetSummaryCommon(@Res() res, @Req() req) {
    try {
      const result = await this.fishProcessorService.summaryCommon(
        req.user._id,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }
}
