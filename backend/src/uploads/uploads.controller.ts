import { Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { UploadsService } from './uploads.service';

@ApiTags('Ảnh')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post('image')
  @ApiOperation({ summary: 'Upload ảnh JPEG/PNG/WebP tối đa 5 MiB, trả URL để lưu vào Image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024, files: 1 } }))
  upload(@UploadedFile(new ParseFilePipe({ validators: [
    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 + 1 }),
    // Validate actual bytes rather than trusting the supplied filename or MIME header.
    new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
  ] })) file: Express.Multer.File) {
    return this.uploads.upload(file);
  }
}
