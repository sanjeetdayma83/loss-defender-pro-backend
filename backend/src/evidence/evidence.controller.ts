import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { EvidenceService } from './evidence.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';

@Controller('evidence')
@UseGuards(JwtAuthGuard, TenantGuard)
export class EvidenceController {
  constructor(private readonly service: EvidenceService) {}

  @Get()
  list(@Req() req: any, @Query('orderId') orderId?: string) {
    return this.service.list(req.user.companyId, orderId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.companyId, id);
  }
}