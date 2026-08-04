import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage/storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly storageService: StorageService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file')) // 'file' is the key expected from frontend
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileUrl = await this.storageService.uploadFile(file);
    return {
      success: true,
      message: 'Video successfully uploaded to secure storage',
      url: fileUrl,
    };
  }
}
