import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderStateMachine {
  /**
   * Allowed order state transitions.
   */
  private readonly transitions: Record<
    OrderStatus,
    OrderStatus[]
  > = {
    CREATED: [
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
      OrderStatus.READY_TO_SHIP,
      OrderStatus.PACKING,
      OrderStatus.CANCELLED,
    ],

    READY_TO_SHIP: [
      OrderStatus.SHIPPED,
      OrderStatus.CANCELLED,
    ],

    SHIPPED: [
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

  /**
   * Returns true if transition is allowed.
   */
  canTransition(
    current: OrderStatus,
    next: OrderStatus,
  ): boolean {
    return (
      this.transitions[current]?.includes(next) ??
      false
    );
  }

  /**
   * Throws exception if transition is invalid.
   */
  validateTransition(
    current: OrderStatus,
    next: OrderStatus,
  ): void {
    if (
      !this.canTransition(current, next)
    ) {
      throw new BadRequestException(
        `Invalid order status transition: ${current} -> ${next}`,
      );
    }
  }

  /**
   * Returns all possible next states.
   */
  getAvailableTransitions(
    current: OrderStatus,
  ): OrderStatus[] {
    return this.transitions[current] ?? [];
  }

  /**
   * Checks if order is finalized.
   */
  isFinalState(
    status: OrderStatus,
  ): boolean {
    return [
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
      OrderStatus.RETURNED,
      OrderStatus.CLAIMED,
    ].includes(status);
  }

  /**
   * Checks if order can still be modified.
   */
  canModify(
    status: OrderStatus,
  ): boolean {
    return !this.isFinalState(status);
  }

  /**
   * Checks if shipment is allowed.
   */
  canShip(
    status: OrderStatus,
  ): boolean {
    return (
      status ===
      OrderStatus.READY_TO_SHIP
    );
  }

  /**
   * Checks if verification may begin.
   */
  canStartVerification(
    status: OrderStatus,
  ): boolean {
    return (
      status ===
      OrderStatus.RECORDING
    );
  }

  /**
   * Checks if packing may begin.
   */
  canStartPacking(
    status: OrderStatus,
  ): boolean {
    return (
      status ===
      OrderStatus.PICKING
    );
  }

  /**
   * Checks if recording may begin.
   */
  canStartRecording(
    status: OrderStatus,
  ): boolean {
    return (
      status ===
      OrderStatus.PACKING
    );
  }
}