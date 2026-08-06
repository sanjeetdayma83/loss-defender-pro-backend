import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RecordingsService } from './recordings.service';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { IsUUID, IsOptional, IsInt, IsString } from 'class-validator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

class StartRecordingDto {
  @IsUUID() orderId: string;
  @IsUUID() warehouseId: string;
}

class StopRecordingDto {
  @IsOptional() @IsInt() durationSec?: number;
  @IsOptional() @IsInt() segmentCount?: number;
}

class PresignSegmentDto {
  @IsInt() segmentIndex: number;
  @IsOptional() @IsString() contentType?: string;
}

@ApiTags('recordings')
@ApiBearerAuth()
@Controller('recordings')
export class RecordingsController {
  constructor(private readonly recordings: RecordingsService) {}

  @Get()
  list(@CurrentUser() u: AuthenticatedUser) {
    return this.recordings.list(u.companyId);
  }

  @Get(':id')
  getOne(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) {
    return this.recordings.getOne(u.companyId, id);
  }

  @Post('start')
  start(@CurrentUser() u: AuthenticatedUser, @Body() dto: StartRecordingDto) {
    return this.recordings.start(u.companyId, u.sub, dto.orderId, dto.warehouseId);
  }

  @Post(':id/stop')
  stop(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: StopRecordingDto,
  ) {
    return this.recordings.stop(u.companyId, id, dto.durationSec, dto.segmentCount);
  }

  @Post(':id/segments/presign')
  presign(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: PresignSegmentDto,
  ) {
    return this.recordings.presignSegment(
      u.companyId,
      id,
      dto.segmentIndex,
      dto.contentType ?? 'video/webm',
    );
  }
}
