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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RecordingStatus } from '@prisma/client';

import { CreateRecordingDto } from '../dto/create-recording.dto';
import { RecordingQueryDto } from '../dto/recording-query.dto';
import { UpdateRecordingDto } from '../dto/update-recording.dto';
import { RecordingService } from '../services/recording.service';

@ApiTags('Recordings')
@ApiBearerAuth()
@Controller('recordings')
export class RecordingController {
  constructor(private readonly recordingService: RecordingService) {}

  @Post()
  @ApiOperation({
    summary: 'Create Recording',
  })
  create(@Body() dto: CreateRecordingDto) {
    return this.recordingService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get All Recordings',
  })
  findAll(@Query() query: RecordingQueryDto) {
    return this.recordingService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Recording By ID',
  })
  findById(@Param('id') id: string) {
    return this.recordingService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update Recording',
  })
  update(@Param('id') id: string, @Body() dto: UpdateRecordingDto) {
    return this.recordingService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Recording',
  })
  delete(@Param('id') id: string) {
    return this.recordingService.delete(id);
  }

  @Post(':id/start')
  @ApiOperation({
    summary: 'Start Recording',
  })
  startRecording(@Param('id') id: string) {
    return this.recordingService.changeStatus(id, RecordingStatus.STARTED);
  }

  @Post(':id/pause')
  @ApiOperation({
    summary: 'Pause Recording',
  })
  pauseRecording(@Param('id') id: string) {
    return this.recordingService.changeStatus(id, RecordingStatus.PAUSED);
  }

  @Post(':id/resume')
  @ApiOperation({
    summary: 'Resume Recording',
  })
  resumeRecording(@Param('id') id: string) {
    return this.recordingService.changeStatus(id, RecordingStatus.RESUMED);
  }

  @Post(':id/stop')
  @ApiOperation({
    summary: 'Stop Recording',
  })
  stopRecording(@Param('id') id: string) {
    return this.recordingService.changeStatus(id, RecordingStatus.STOPPED);
  }

  @Post(':id/upload')
  @ApiOperation({
    summary: 'Mark Recording Uploading',
  })
  uploadRecording(@Param('id') id: string) {
    return this.recordingService.changeStatus(id, RecordingStatus.UPLOADING);
  }

  @Post(':id/uploaded')
  @ApiOperation({
    summary: 'Mark Recording Uploaded',
  })
  uploadedRecording(@Param('id') id: string) {
    return this.recordingService.changeStatus(id, RecordingStatus.UPLOADED);
  }

  @Post(':id/process')
  @ApiOperation({
    summary: 'Start AI Processing',
  })
  processRecording(@Param('id') id: string) {
    return this.recordingService.changeStatus(id, RecordingStatus.PROCESSING);
  }

  @Post(':id/complete')
  @ApiOperation({
    summary: 'Complete Recording Processing',
  })
  completeRecording(@Param('id') id: string) {
    return this.recordingService.changeStatus(id, RecordingStatus.COMPLETED);
  }

  @Post(':id/fail')
  @ApiOperation({
    summary: 'Mark Recording Failed',
  })
  failRecording(@Param('id') id: string) {
    return this.recordingService.changeStatus(id, RecordingStatus.FAILED);
  }
}
