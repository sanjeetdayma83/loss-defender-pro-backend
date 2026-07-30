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

import {
  ReturnPriority,
  ReturnResolutionType,
  ReturnStatus,
} from '@prisma/client';

import { CreateReturnDto } from '../dto/create-return.dto';
import { ReturnQueryDto } from '../dto/return-query.dto';
import { UpdateReturnDto } from '../dto/update-return.dto';
import { ReturnService } from '../services/return.service';

@Controller('returns')
export class ReturnsController {
  constructor(
    private readonly returnService: ReturnService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateReturnDto,
  ) {
    return this.returnService.create(dto);
  }

  @Get()
  findAll(
    @Query() query: ReturnQueryDto,
  ) {
    return this.returnService.findAll(query);
  }

  @Get('statistics')
  getStatistics() {
    return this.returnService.getStatistics();
  }

  @Get(':id')
  findById(
    @Param('id') id: string,
  ) {
    return this.returnService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReturnDto,
  ) {
    return this.returnService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.returnService.remove(id);
  }

  @Patch(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body('status')
    status: ReturnStatus,
  ) {
    return this.returnService.changeStatus(
      id,
      status,
    );
  }

  @Patch(':id/priority')
  changePriority(
    @Param('id') id: string,
    @Body('priority')
    priority: ReturnPriority,
  ) {
    return this.returnService.changePriority(
      id,
      priority,
    );
  }

  @Patch(':id/assign')
  assign(
    @Param('id') id: string,
    @Body('assignedTo')
    assignedTo: string,
  ) {
    return this.returnService.assign(
      id,
      assignedTo,
    );
  }

  @Post(':id/analyze')
  analyze(
    @Param('id') id: string,
  ) {
    return this.returnService.analyze(id);
  }

  @Post(':id/validate-evidence')
  validateEvidence(
    @Param('id') id: string,
  ) {
    return this.returnService.validateEvidence(
      id,
    );
  }

  @Post(':id/approve')
  approve(
    @Param('id') id: string,
  ) {
    return this.returnService.approve(id);
  }

  @Post(':id/reject')
  reject(
    @Param('id') id: string,
    @Body('reason')
    reason?: string,
  ) {
    return this.returnService.reject(
      id,
      reason,
    );
  }

  @Post(':id/refund')
  refund(
    @Param('id') id: string,
    @Body('resolutionType')
    resolutionType: ReturnResolutionType,
    @Body('refundedBy')
    refundedBy: string,
    @Body('refundData')
    refundData?: Record<
      string,
      unknown
    >,
  ) {
    return this.returnService.refund(
      id,
      resolutionType,
      refundedBy,
      refundData,
    );
  }

  @Post(':id/replace')
  replace(
    @Param('id') id: string,
    @Body('resolutionType')
    resolutionType: ReturnResolutionType,
    @Body('processedBy')
    processedBy: string,
    @Body('replacementData')
    replacementData?: Record<
      string,
      unknown
    >,
  ) {
    return this.returnService.replace(
      id,
      resolutionType,
      processedBy,
      replacementData,
    );
  }

  @Post(':id/close')
  close(
    @Param('id') id: string,
  ) {
    return this.returnService.close(id);
  }

  @Post(':id/reopen')
  reopen(
    @Param('id') id: string,
  ) {
    return this.returnService.reopen(id);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id') id: string,
  ) {
    return this.returnService.cancel(id);
  }

  @Post(':id/escalate')
  escalate(
    @Param('id') id: string,
  ) {
    return this.returnService.escalate(id);
  }

  @Post(':id/generate-resolution')
  generateResolution(
    @Param('id') id: string,
  ) {
    return this.returnService.generateResolution(
      id,
    );
  }
}