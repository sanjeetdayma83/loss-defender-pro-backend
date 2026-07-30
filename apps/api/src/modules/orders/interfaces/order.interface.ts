import { Order } from '@prisma/client';

import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderQueryDto } from '../dto/order-query.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import {
  OrderStatistics,
  OrderSearchResult,
} from '../types/order.types';

export interface IOrderService {
  create(
    dto: CreateOrderDto,
  ): Promise<Order>;

  update(
    id: string,
    dto: UpdateOrderDto,
  ): Promise<Order>;

  remove(
    id: string,
  ): Promise<Order>;

  findById(
    id: string,
  ): Promise<Order>;

  findAll(
    query: OrderQueryDto,
  ): Promise<
    OrderSearchResult<Order>
  >;

  assignWarehouse(
    id: string,
    warehouseId: string,
    assignedTo: string,
  ): Promise<Order>;

  startPicking(
    id: string,
  ): Promise<Order>;

  startPacking(
    id: string,
  ): Promise<Order>;

  completePacking(
    id: string,
  ): Promise<Order>;

  startRecording(
    id: string,
  ): Promise<Order>;

  completeRecording(
    id: string,
  ): Promise<Order>;

  startVerification(
    id: string,
  ): Promise<Order>;

  completeVerification(
    id: string,
  ): Promise<Order>;

  readyToShip(
    id: string,
  ): Promise<Order>;

  ship(
    id: string,
    trackingNumber?: string,
  ): Promise<Order>;

  deliver(
    id: string,
  ): Promise<Order>;

  cancel(
    id: string,
    reason?: string,
  ): Promise<Order>;

  reopen(
    id: string,
  ): Promise<Order>;

  archive(
    id: string,
  ): Promise<Order>;

  generateOrderNumber(): Promise<string>;

  getStatistics(): Promise<OrderStatistics>;
}