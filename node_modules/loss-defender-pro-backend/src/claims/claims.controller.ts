import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';

@Controller('claims')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ClaimsController {
  constructor(private readonly service: ClaimsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateClaimDto) {
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
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateClaimDto) {
    return this.service.update(req.user.companyId, id, dto);
  }
}