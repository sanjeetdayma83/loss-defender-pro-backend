import {
  Controller, Post, Get, Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { RecordingsService } from './recordings.service';
import { StartRecordingDto } from './dto/start-recording.dto';
import { AddSegmentDto } from './dto/add-segment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';

@Controller('recordings')
@UseGuards(JwtAuthGuard, TenantGuard)
export class RecordingsController {
  constructor(private readonly service: RecordingsService) {}

  @Post('start')
  start(@Req() req: any, @Body() dto: StartRecordingDto) {
    return this.service.start(req.user.companyId, req.user.sub ?? req.user.id, dto);
  }

  @Post(':id/pause')
  pause(@Req() req: any, @Param('id') id: string) {
    return this.service.pause(req.user.companyId, id);
  }

  @Post(':id/resume')
  resume(@Req() req: any, @Param('id') id: string) {
    return this.service.resume(req.user.companyId, id);
  }

  @Post(':id/stop')
  stop(@Req() req: any, @Param('id') id: string) {
    return this.service.stop(req.user.companyId, id);
  }

  @Post(':id/segments')
  addSegment(@Req() req: any, @Param('id') id: string, @Body() dto: AddSegmentDto) {
    return this.service.addSegment(req.user.companyId, id, dto);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.companyId, id);
  }

  @Get()
  list(@Req() req: any, @Query('orderId') orderId?: string) {
    return this.service.list(req.user.companyId, orderId);
  }
}