import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { OrderRepository } from '../repositories/order.repository';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrderQueryDto } from '../dto/order-query.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
  ) {}

  async create(
    companyId: string,
    createdById: string,
    dto: CreateOrderDto,
  ) {
    const exists =
      await this.orderRepository.exists(
        companyId,
        dto.orderNumber,
      );

    if (exists) {
      throw new ConflictException(
        'Order already exists.',
      );
    }

    return this.orderRepository.create({
      company: {
        connect: {
          id: companyId,
        },
      },
      warehouse: {
        connect: {
          id: dto.warehouseId,
        },
      },
      createdBy: {
        connect: {
          id: createdById,
        },
      },
      marketplace: dto.marketplace,
      marketplaceOrderId:
        dto.marketplaceOrderId,
      marketplaceShipmentId:
        dto.marketplaceShipmentId,
      orderNumber: dto.orderNumber,
      awbNumber: dto.awbNumber,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      status: dto.status,
      verificationStatus:
        dto.verificationStatus,
      expectedItemCount:
        dto.expectedItemCount,
      verifiedItemCount:
        dto.verifiedItemCount,
    });
  }

  async findAll(query: OrderQueryDto) {
    const page = query.page;
    const limit = query.limit;

    const skip = (page - 1) * limit;

    const where = {
      isDeleted: false,
      ...(query.marketplace && {
        marketplace: query.marketplace,
      }),
      ...(query.warehouseId && {
        warehouseId: query.warehouseId,
      }),
      ...(query.status && {
        status: query.status,
      }),
      ...(query.verificationStatus && {
        verificationStatus:
          query.verificationStatus,
      }),
    };

    const [items, total] =
      await Promise.all([
        this.orderRepository.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            [query.sortBy]:
              query.sortOrder,
          },
        }),
        this.orderRepository.count(where),
      ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(
        total / limit,
      ),
    };
  }

  async findOne(id: string) {
    const order =
      await this.orderRepository.findById(id);

    if (!order) {
      throw new NotFoundException(
        'Order not found.',
      );
    }

    return order;
  }

  async update(
    id: string,
    dto: UpdateOrderDto,
  ) {
    await this.findOne(id);

    return this.orderRepository.update(
      id,
      dto,
    );
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.orderRepository.softDelete(
      id,
    );

    return {
      message:
        'Order deleted successfully.',
    };
  }
}