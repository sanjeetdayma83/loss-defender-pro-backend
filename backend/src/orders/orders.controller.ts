import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { IsString, IsOptional } from 'class-validator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

class TransitionDto {
  @IsString() status: string;
}

class DispatchDto {
  @IsString() awb: string;
}

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  list(@CurrentUser() u: AuthenticatedUser) {
    return this.orders.list(u.companyId);
  }

  @Get(':id')
  getOne(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) {
    return this.orders.getOne(u.companyId, id);
  }

  @Patch(':id/status')
  @Roles(Role.owner, Role.manager, Role.supervisor, Role.packing_operator)
  transition(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: TransitionDto,
  ) {
    return this.orders.transition(u.companyId, id, dto.status);
  }

  @Post(':id/dispatch')
  @Roles(Role.owner, Role.manager, Role.supervisor)
  dispatch(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: DispatchDto,
  ) {
    return this.orders.dispatch(u.companyId, id, dto.awb);
  }

  @Post(':id/ship')
  @Roles(Role.owner, Role.manager, Role.supervisor)
  ship(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) {
    return this.orders.markShipped(u.companyId, id);
  }
}
