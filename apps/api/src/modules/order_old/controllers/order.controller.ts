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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PERMISSIONS } from '../../auth/constants/permissions';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderQueryDto } from '../dto/order-query.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrderService } from '../services/order.service';

interface AuthenticatedUser {
  id: string;
  companyId: string;
}

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create order' })
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.COMPANY_ADMIN,
    UserRole.WAREHOUSE_MANAGER,
  )
  @Permissions(PERMISSIONS.ORDER_CREATE)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateOrderDto) {
    return this.orderService.create(user.companyId, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get orders' })
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.COMPANY_ADMIN,
    UserRole.WAREHOUSE_MANAGER,
    UserRole.SUPERVISOR,
    UserRole.OPERATOR,
    UserRole.VIEWER,
  )
  @Permissions(PERMISSIONS.ORDER_VIEW)
  findAll(@Query() query: OrderQueryDto) {
    return this.orderService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.COMPANY_ADMIN,
    UserRole.WAREHOUSE_MANAGER,
    UserRole.SUPERVISOR,
    UserRole.OPERATOR,
    UserRole.VIEWER,
  )
  @Permissions(PERMISSIONS.ORDER_VIEW)
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order' })
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.COMPANY_ADMIN,
    UserRole.WAREHOUSE_MANAGER,
  )
  @Permissions(PERMISSIONS.ORDER_UPDATE)
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.orderService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  @Permissions(PERMISSIONS.ORDER_DELETE)
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
