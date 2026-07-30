import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { UploadStatus } from '@prisma/client';

import { CreateUploadDto } from '../dto/create-upload.dto';
import { UpdateUploadDto } from '../dto/update-upload.dto';
import { UploadQueryDto } from '../dto/upload-query.dto';

import { UploadService } from '../services/upload.service';

@Controller('uploads')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  create(
    @Body()
    dto: CreateUploadDto,
  ) {
    return this.uploadService.create(dto);
  }

  @Get()
  findAll(
    @Query()
    query: UploadQueryDto,
  ) {
    return this.uploadService.findAll(
      query,
    );
  }

  @Get(':id')
  findById(
    @Param('id')
    id: string,
  ) {
    return this.uploadService.findById(
      id,
    );
  }

  @Patch(':id')
  update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateUploadDto,
  ) {
    return this.uploadService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  delete(
    @Param('id')
    id: string,
  ) {
    return this.uploadService.delete(
      id,
    );
  }

  @Patch(':id/status/:status')
  changeStatus(
    @Param('id')
    id: string,

    @Param('status')
    status: UploadStatus,
  ) {
    return this.uploadService.changeStatus(
      id,
      status,
    );
  }

  @Post(':id/uploading')
  markUploading(
    @Param('id')
    id: string,
  ) {
    return this.uploadService.markUploading(
      id,
    );
  }

  @Post(':id/uploaded')
  markUploaded(
    @Param('id')
    id: string,
  ) {
    return this.uploadService.markUploaded(
      id,
    );
  }

  @Post(':id/processing')
  markProcessing(
    @Param('id')
    id: string,
  ) {
    return this.uploadService.markProcessing(
      id,
    );
  }

  @Post(':id/completed')
  markCompleted(
    @Param('id')
    id: string,
  ) {
    return this.uploadService.markCompleted(
      id,
    );
  }

  @Post(':id/failed')
  markFailed(
    @Param('id')
    id: string,
  ) {
    return this.uploadService.markFailed(
      id,
    );
  }

  @Post(':id/cancel')
  cancel(
    @Param('id')
    id: string,
  ) {
    return this.uploadService.cancel(
      id,
    );
  }

  @Get('download-url/:key')
  generateDownloadUrl(
    @Param('key')
    key: string,
  ) {
    return this.uploadService.generateDownloadUrl(
      key,
    );
  }

  @Get('upload-url/:key')
  generateUploadUrl(
    @Param('key')
    key: string,
  ) {
    return this.uploadService.generateUploadUrl(
      key,
    );
  }
}