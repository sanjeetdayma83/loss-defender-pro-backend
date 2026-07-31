import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderStateMachine {
  /**
   * Allowed order state transitions.
   * Every OrderStatus enum value must appear as a key.
   */
  private readonly transitions: Record<OrderStatus, OrderStatus[]> = {
    CREATED: [
      OrderStatus.PENDING,
      OrderStatus.ASSIGNED,
      OrderStatus.CANCELLED,
    ],

    PENDING: [
      OrderStatus.ASSIGNED,
      OrderStatus.CANCELLED,
    ],

    ASSIGNED: [
      OrderStatus.PICKING,
      OrderStatus.CANCELLED,
    ],

    PICKING: [
      OrderStatus.PACKING,
      OrderStatus.CANCELLED,
    ],

    PACKING: [
      OrderStatus.RECORDING,
      OrderStatus.CANCELLED,
    ],

    RECORDING: [
      OrderStatus.VERIFYING,
      OrderStatus.CANCELLED,
    ],

    VERIFYING: [
      OrderStatus.VERIFIED,
      OrderStatus.READY_TO_SHIP,
      OrderStatus.PACKING,
      OrderStatus.CANCELLED,
    ],

    VERIFIED: [
      OrderStatus.READY_TO_SHIP,
      OrderStatus.DISPATCHED,
      OrderStatus.CANCELLED,
    ],

    READY_TO_SHIP: [
      OrderStatus.SHIPPED,
      OrderStatus.DISPATCHED,
      OrderStatus.CANCELLED,
    ],

    SHIPPED: [
      OrderStatus.DISPATCHED,
      OrderStatus.DELIVERED,
      OrderStatus.RETURNED,
      OrderStatus.CLAIMED,
    ],

    DISPATCHED: [
      OrderStatus.DELIVERED,
      OrderStatus.RETURNED,
      OrderStatus.CLAIMED,
    ],

    DELIVERED: [
      OrderStatus.RETURNED,
      OrderStatus.CLAIMED,
    ],

    RETURNED: [],

    CLAIMED: [],

    CANCELLED: [],
  };

  canTransition(current: OrderStatus, next: OrderStatus): boolean {
    return this.transitions[current]?.includes(next) ?? false;
  }

  validateTransition(current: OrderStatus, next: OrderStatus): void {
    if (!this.canTransition(current, next)) {
      throw new BadRequestException(
        `Invalid order status transition: ${current} -> ${next}`,
      );
    }
  }

  getAvailableTransitions(current: OrderStatus): OrderStatus[] {
    return this.transitions[current] ?? [];
  }

  isFinalState(status: OrderStatus): boolean {
    const finalStates: OrderStatus[] = [
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
      OrderStatus.RETURNED,
      OrderStatus.CLAIMED,
    ];
    return finalStates.includes(status);
  }

  canModify(status: OrderStatus): boolean {
    return !this.isFinalState(status);
  }

  canShip(status: OrderStatus): boolean {
    return status === OrderStatus.READY_TO_SHIP;
  }

  canStartVerification(status: OrderStatus): boolean {
    return status === OrderStatus.RECORDING;
  }

  canStartPacking(status: OrderStatus): boolean {
    return status === OrderStatus.PICKING;
  }

  canStartRecording(status: OrderStatus): boolean {
    return status === OrderStatus.PACKING;
  }
}