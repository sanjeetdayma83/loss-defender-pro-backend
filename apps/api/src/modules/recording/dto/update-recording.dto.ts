import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RecordingStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

import { CreateRecordingDto } from './create-recording.dto';

export class UpdateRecordingDto extends PartialType(CreateRecordingDto) {
  @ApiPropertyOptional({
    enum: RecordingStatus,
    description: 'Recording status',
  })
  @IsOptional()
  @IsEnum(RecordingStatus)
  status?: RecordingStatus;

  @ApiPropertyOptional({
    description: 'Recording file URL',
    example: 'https://storage.lossdefenderpro.in/videos/video.mp4',
  })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({
    description: 'Recording thumbnail URL',
    example: 'https://storage.lossdefenderpro.in/thumbnails/video.jpg',
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Recording duration in seconds',
    example: 145,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;

  @ApiPropertyOptional({
    description: 'Uploaded file size in bytes',
    example: 24567891,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;
}
