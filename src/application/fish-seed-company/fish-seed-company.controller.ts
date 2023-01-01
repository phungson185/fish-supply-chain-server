import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Get, Param } from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseQueryParams } from 'src/domain/dtos';
import { JwtFishSeedCompanyAuthGuard } from '../auth/jwt-auth.guard';
import { FarmedFishContractDto } from './dtos';
import { FishSeedCompanyService } from './fish-seed-company.service';

@UseGuards(JwtFishSeedCompanyAuthGuard)
@ApiBearerAuth('JWT')
@Controller('fishseedcompany')
@ApiTags('FishSeedCompanyEndpoints')
export class FishSeedCompanyController {
  constructor(private fishSeedCompanyService: FishSeedCompanyService) {}

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

  @Get('contracts')
  public async GetFarmedFishContracts(@Res() res, @Req() req, @Param() params: BaseQueryParams) {
    try {
      const result = await this.fishSeedCompanyService.getFarmedFishContracts(
        req.user._id,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }
}
