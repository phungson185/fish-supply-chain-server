import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  Query,
  Req,
  Res,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { BaseQueryParams } from 'src/domain/dtos';
import { RoleType } from 'src/domain/enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/role.decorator';
import { RolesGuard } from '../auth/role.guard';
import {
  AddFishSeedDto,
  FarmedFishContractDto,
  QueryFishSeed,
  UpdateFarmedFishContractDto,
} from './dtos';
import { BatchDto } from './dtos/batch.dto';
import { FishSeedCompanyService } from './fish-seed-company.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
@Controller('fishseedcompany')
@ApiTags('FishSeedCompanyEndpoints')
export class FishSeedCompanyController {
  constructor(private fishSeedCompanyService: FishSeedCompanyService) {}

  @Roles(RoleType.FishSeedCompany)
  @Post('createFarmedFishContract')
  public async CreateFarmedFishContract(
    @Res() res,
    @Req() req,
    @Body() farmedFishContractDto: FarmedFishContractDto,
  ) {
    farmedFishContractDto.owner = req.user._id;
    try {
      const result = await this.fishSeedCompanyService.createFarmedFishContract(
        farmedFishContractDto,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.FishSeedCompany)
  @Get('contracts')
  public async GetFarmedFishContracts(
    @Res() res,
    @Query() queries: BaseQueryParams,
  ) {
    try {
      const result = await this.fishSeedCompanyService.getFarmedFishContracts(
        queries,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.FishSeedCompany, RoleType.FishFarmer)
  @Get('contract/:id')
  public async GetFarmedFishContract(@Res() res, @Param('id') id: string) {
    try {
      const result = await this.fishSeedCompanyService.getFarmedFishContract(
        id,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.FishSeedCompany, RoleType.FishFarmer)
  @Put('contract/:id')
  public async UpdateFarmedFishContract(
    @Res() res,
    @Param('id') id: string,
    @Body() updateFarmedFishContractDto: UpdateFarmedFishContractDto,
  ) {
    try {
      const result = await this.fishSeedCompanyService.updateFarmedFishContract(
        id,
        updateFarmedFishContractDto,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.FishSeedCompany)
  @Post('createBatch')
  public async CreateBatch(@Res() res, @Body() batchDto: BatchDto) {
    try {
      const result = await this.fishSeedCompanyService.createBatch(batchDto);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.FishSeedCompany)
  @Get('getFishSeeds')
  public async getFishSeeds(@Res() res, @Query() queries: QueryFishSeed) {
    try {
      const result = await this.fishSeedCompanyService.getFishSeeds(queries);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.FishSeedCompany)
  @Get('getFishSeed/:id')
  public async getFishSeed(@Res() res, @Req() req, @Param('id') id: string) {
    try {
      const result = await this.fishSeedCompanyService.getFishSeed(id);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.FishSeedCompany)
  @Post('addFishSeed')
  public async addFishSeed(
    @Res() res,
    @Req() req,
    @Body() addFishSeedDto: AddFishSeedDto,
  ) {
    try {
      const result = await this.fishSeedCompanyService.addFishSeed(
        req.user._id,
        addFishSeedDto,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.FishSeedCompany)
  @Put('updateFishSeed/:id')
  public async updateFishSeed(
    @Res() res,
    @Req() req,
    @Param('id') id: string,
    @Body() addFishSeedDto: AddFishSeedDto,
  ) {
    try {
      const result = await this.fishSeedCompanyService.updateFishSeed(
        id,
        addFishSeedDto,
        req.user._id,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.FishSeedCompany)
  @Get('summaryCommon')
  public async GetSummaryCommon(@Res() res, @Req() req) {
    try {
      const result = await this.fishSeedCompanyService.summaryCommon(
        req.user._id,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Roles(RoleType.FishSeedCompany)
  @Get('summaryMostOrder/:geographicOrigin/:methodOfReproduction')
  public async GetSummary(
    @Res() res,
    @Req() req,
    @Param('geographicOrigin') geographicOrigin?: number,
    @Param('methodOfReproduction') methodOfReproduction?: number,
  ) {
    try {
      const result = await this.fishSeedCompanyService.summaryMostOrder(
        req.user._id,
        geographicOrigin,
        methodOfReproduction,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }
}
