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
  ClaimPriority,
  ClaimResolutionType,
  ClaimStatus,
  Prisma,
} from '@prisma/client';

import { CreateClaimDto } from '../dto/create-claim.dto';
import { UpdateClaimDto } from '../dto/update-claim.dto';
import { ClaimQueryDto } from '../dto/claim-query.dto';
import { ClaimService } from '../services/claim.service';

@Controller('claims')
export class ClaimsController {
  constructor(
    private readonly claimsService: ClaimService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateClaimDto,
  ) {
    return this.claimsService.create(dto);
  }

  @Get()
  findAll(
    @Query() query: ClaimQueryDto,
  ) {
    return this.claimsService.findAll(query);
  }

  @Get('statistics')
  getStatistics() {
    return this.claimsService.getStatistics();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.claimsService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClaimDto,
  ) {
    return this.claimsService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.claimsService.remove(id);
  }

  @Patch(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body('status')
    status: ClaimStatus,
  ) {
    return this.claimsService.changeStatus(
      id,
      status,
    );
  }

  @Patch(':id/priority')
  changePriority(
    @Param('id') id: string,
    @Body('priority')
    priority: ClaimPriority,
  ) {
    return this.claimsService.changePriority(
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
    return this.claimsService.assign(
      id,
      assignedTo,
    );
  }

  @Post(':id/analyze')
  analyze(
    @Param('id') id: string,
  ) {
    return this.claimsService.analyze(id);
  }

  @Post(':id/validate-evidence')
  validateEvidence(
    @Param('id') id: string,
  ) {
    return this.claimsService.validateEvidence(
      id,
    );
  }

  @Post(':id/resolve')
  resolve(
    @Param('id') id: string,
    @Body('resolutionType')
    resolutionType: ClaimResolutionType,
    @Body('resolvedBy')
    resolvedBy: string,
    @Body('resolutionData')
resolutionData?: Prisma.JsonValue,
  ) {
    return this.claimsService.resolve(
      id,
      resolutionType,
      resolvedBy,
      resolutionData,
    );
  }

  @Post(':id/close')
  close(
    @Param('id') id: string,
  ) {
    return this.claimsService.close(id);
  }

  @Post(':id/reopen')
  reopen(
    @Param('id') id: string,
  ) {
    return this.claimsService.reopen(id);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id') id: string,
  ) {
    return this.claimsService.cancel(id);
  }

  @Post(':id/escalate')
  escalate(
    @Param('id') id: string,
  ) {
    return this.claimsService.escalate(id);
  }

  @Post(':id/generate-resolution')
  generateResolution(
    @Param('id') id: string,
  ) {
    return this.claimsService.generateResolution(
      id,
    );
  }
}