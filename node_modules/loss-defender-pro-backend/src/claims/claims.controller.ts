import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { IsString, IsOptional, IsUUID, IsNumber } from 'class-validator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

class CreateClaimDto {
  @IsOptional() @IsUUID() orderId?: string;
  @IsString() title: string;
  @IsOptional() @IsString() reason?: string;
  @IsOptional() @IsNumber() amount?: number;
}

class UpdateClaimDto {
  @IsString() status: string;
}

@ApiTags('claims')
@ApiBearerAuth()
@Controller('claims')
export class ClaimsController {
  constructor(private readonly claims: ClaimsService) {}

  @Get()
  list(@CurrentUser() u: AuthenticatedUser) {
    return this.claims.list(u.companyId);
  }

  @Post()
  create(@CurrentUser() u: AuthenticatedUser, @Body() dto: CreateClaimDto) {
    return this.claims.create(u.companyId, u.sub, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateClaimDto,
  ) {
    return this.claims.updateStatus(u.companyId, id, dto.status);
  }
}
