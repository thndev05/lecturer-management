import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadsService {
  constructor(private readonly config: ConfigService) {}

  async upload(file: Express.Multer.File) {
    const cloud_name = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const api_key = this.config.get<string>('CLOUDINARY_API_KEY');
    const api_secret = this.config.get<string>('CLOUDINARY_API_SECRET');
    const folder = this.config.get<string>('CLOUDINARY_FOLDER');
    if (!cloud_name || !api_key || !api_secret || !folder) {
      throw new ServiceUnavailableException('Chưa cấu hình đầy đủ Cloudinary');
    }
    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ cloud_name, api_key, api_secret, folder, resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        }, (error, response) => {
          if (error || !response) reject(error ?? new Error('Empty upload response'));
          else resolve(response);
        }).end(file.buffer);
      });
      return { Image: result.secure_url };
    } catch {
      throw new ServiceUnavailableException('Không thể upload ảnh lên Cloudinary, vui lòng thử lại');
    }
  }
}
