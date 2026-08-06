import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  AssignOrderDto,
  UpdateOrderStatusDto,
  ScanItemDto,
  DispatchOrderDto,
} from './dto/order.dto';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, OrderStatus } from '@prisma/client';
import { Request } from 'express';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: OrderStatus,
  ) {
    return this.orders.list(user.companyId, status);
  }

  @Get(':id')
  getOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.orders.getOne(user.companyId, id);
  }

  @Post()
  @Roles(
    Role.owner,
    Role.manager,
    Role.supervisor,
    Role.marketplace_manager,
    Role.super_admin,
  )
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOrderDto,
    @Req() req: Request,
  ) {
    return this.orders.create(user.companyId, user.sub, dto, req.ip);
  }

  @Post(':id/assign')
  @Roles(Role.owner, Role.manager, Role.supervisor, Role.super_admin)
  assign(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AssignOrderDto,
    @Req() req: Request,
  ) {
    return this.orders.assign(user.companyId, id, user.sub, dto, req.ip);
  }

  @Patch(':id/status')
  @Roles(
    Role.owner,
    Role.manager,
    Role.supervisor,
    Role.packing_operator,
    Role.super_admin,
  )
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: Request,
  ) {
    return this.orders.updateStatus(user.companyId, id, user.sub, dto, req.ip);
  }

  @Post(':id/scan')
  @Roles(
    Role.owner,
    Role.manager,
    Role.supervisor,
    Role.packing_operator,
    Role.qc_operator,
    Role.super_admin,
  )
  scan(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ScanItemDto,
  DispatchOrderDto,
    @Req() req: Request,
  ) {
    return this.orders.scan(user.companyId, id, user.sub, dto, req.ip);
  }
  @Post(':id/dispatch')
  @Roles(
    Role.owner,
    Role.manager,
    Role.supervisor,
    Role.packing_operator,
    Role.super_admin,
  )
  dispatch(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: DispatchOrderDto,
    @Req() req: Request,
  ) {
    return this.orders.dispatch(user.companyId, id, user.sub, dto, req.ip);
  }
}