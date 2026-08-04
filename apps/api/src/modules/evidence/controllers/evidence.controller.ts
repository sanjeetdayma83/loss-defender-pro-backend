import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateEvidenceDto } from '../dto/create-evidence.dto';
import { EvidenceQueryDto } from '../dto/evidence-query.dto';
import { UpdateEvidenceDto } from '../dto/update-evidence.dto';
import { EvidenceService } from '../services/evidence.service';

@ApiTags('Evidence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.WAREHOUSE_MANAGER,
  UserRole.SUPERVISOR,
  UserRole.OPERATOR,
  UserRole.VIEWER,
)
@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post()
  @ApiOperation({
    summary: 'Create Evidence',
  })
  create(@Body() dto: CreateEvidenceDto) {
    return this.evidenceService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get All Evidence',
  })
  findAll(@Query() query: EvidenceQueryDto) {
    return this.evidenceService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Evidence By ID',
  })
  findById(@Param('id') id: string) {
    return this.evidenceService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update Evidence',
  })
  update(@Param('id') id: string, @Body() dto: UpdateEvidenceDto) {
    return this.evidenceService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Evidence',
  })
  delete(@Param('id') id: string) {
    return this.evidenceService.delete(id);
  }

  @Post(':id/generate')
  @ApiOperation({
    summary: 'Start Evidence Generation',
  })
  startGeneration(@Param('id') id: string) {
    return this.evidenceService.startGeneration(id);
  }

  @Post(':id/generated')
  @ApiOperation({
    summary: 'Mark Evidence Generated',
  })
  markGenerated(@Param('id') id: string) {
    return this.evidenceService.markGenerated(id);
  }

  @Post(':id/verify')
  @ApiOperation({
    summary: 'Verify Evidence',
  })
  verify(@Param('id') id: string) {
    return this.evidenceService.verify(id);
  }

  @Post(':id/archive')
  @ApiOperation({
    summary: 'Archive Evidence',
  })
  archive(@Param('id') id: string) {
    return this.evidenceService.archive(id);
  }

  @Post(':id/fail')
  @ApiOperation({
    summary: 'Mark Evidence Failed',
  })
  fail(@Param('id') id: string) {
    return this.evidenceService.fail(id);
  }
}


