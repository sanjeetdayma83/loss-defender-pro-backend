import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnDto } from './dto/update-return.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';

@Controller('returns')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ReturnsController {
  constructor(private readonly service: ReturnsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateReturnDto) {
    return this.service.create(req.user.companyId, dto);
  }

  @Get()
  list(@Req() req: any, @Query('status') status?: string) {
    return this.service.list(req.user.companyId, status);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.companyId, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateReturnDto) {
    return this.service.update(req.user.companyId, id, dto);
  }
}