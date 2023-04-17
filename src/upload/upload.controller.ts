import {
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

@Controller('upload')
@ApiTags('UploadEndpoint')
@ApiExtraModels()
export class UploadController {
  private storage: any;
  private upload: any;
  constructor(
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });

    this.storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'nest',
      } as any,
    });

    this.upload = multer({
      storage: this.storage,
    }).single('file');
  }

  @Post()
  @ApiOkResponse({
    schema: {
      allOf: [
        {
          properties: {
            success: { type: 'boolean' },
            data: { type: 'string' },
            errors: { type: 'object' },
          },
        },
      ],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(
    @Res() res,
    @Req() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        data: '',
        errors: {
          message: 'File is required',
        },
      });
    }

    // upload file to cloudinary
    this.upload(req, res, async (err) => {
      if (err) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: '',
          errors: {
            message: err.message,
          },
        });
      }
      return res.status(HttpStatus.OK).json({
        success: true,
        data: req.file.path,
        errors: null,
      });
    });
  }
}
