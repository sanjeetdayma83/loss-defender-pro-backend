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

import { AIJobStatus } from '@prisma/client';

import { AiService } from '../services/ai.service';

import { CreateAiJobDto } from '../dto/create-ai-job.dto';
import { UpdateAiJobDto } from '../dto/update-ai-job.dto';
import { AiQueryDto } from '../dto/ai-query.dto';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateAiJobDto,
  ) {
    return this.aiService.create(dto);
  }

  @Get()
  findAll(
    @Query() query: AiQueryDto,
  ) {
    return this.aiService.findAll(query);
  }

  @Get('count')
  count(
    @Query() query: AiQueryDto,
  ) {
    return this.aiService.count(query);
  }

  @Get('health')
  healthCheck() {
    return this.aiService.healthCheck();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.aiService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAiJobDto,
  ) {
    return this.aiService.update(
      id,
      dto,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status')
    status: AIJobStatus,
  ) {
    return this.aiService.updateStatus(
      id,
      status,
    );
  }

  @Post(':id/execute')
  execute(
    @Param('id') id: string,
  ) {
    return this.aiService.execute(id);
  }

  @Post(':id/retry')
  retry(
    @Param('id') id: string,
  ) {
    return this.aiService.retry(id);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.aiService.remove(id);
  }
}