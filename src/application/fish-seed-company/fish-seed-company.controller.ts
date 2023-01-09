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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseQueryParams } from 'src/domain/dtos';
import { JwtFishSeedCompanyAuthGuard } from '../auth/jwt-auth.guard';
import { FarmedFishContractDto } from './dtos';
import { BatchDto } from './dtos/batch.dto';
import { UpdateFarmedFishContractDto } from './dtos/update-farmed-fish-contract.dto';
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

  // @Put('contract')
  // public async UpdateFarmedFishContract(
  //   @Res() res,
  //   @Body() updateFarmedFishContractDto: UpdateFarmedFishContractDto,
  // ) {
  //   try {
  //     const result = await this.fishSeedCompanyService.updateFarmedFishContract(
  //       updateFarmedFishContractDto,
  //     );
  //     return res.status(HttpStatus.OK).json(result);
  //   } catch (error) {
  //     return res.status(HttpStatus.BAD_REQUEST).json(error);
  //   }
  // }

  @Post('createBatch')
  public async CreateBatch(@Res() res, @Body() batchDto: BatchDto) {
    try {
      const result = await this.fishSeedCompanyService.createBatch(batchDto);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }
}
