import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary/types';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
const multer = require('multer');

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  public async uploadFile(res, req) {
    return new Promise((resolve, reject) => {
      console.log(this.configService.get('CLOUDINARY_CLOUD_NAME'));

      const upload = multer({
        storage: new CloudinaryStorage({
          cloudinary,
          params: {
            folder: 'nest',
          } as any,
        }),
      }).single('file');

      upload(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(req.file);
        }
      });
    });
  }

  async delete(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async getSignedUrl(publicId: string): Promise<string> {
    const options = { resource_type: 'image' };
    return cloudinary.url(publicId, options);
  }
}
