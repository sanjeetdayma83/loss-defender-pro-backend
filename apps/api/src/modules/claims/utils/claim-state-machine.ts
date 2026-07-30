import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import {
  ClaimStatus,
} from '@prisma/client';

@Injectable()
export class ClaimStateMachine {
  private readonly transitions: Record<
    ClaimStatus,
    ClaimStatus[]
  > = {
    DRAFT: [
      ClaimStatus.OPEN,
      ClaimStatus.CANCELLED,
    ],

    OPEN: [
      ClaimStatus.UNDER_REVIEW,
      ClaimStatus.CANCELLED,
    ],

    UNDER_REVIEW: [
      ClaimStatus.AI_ANALYZING,
      ClaimStatus.APPROVED,
      ClaimStatus.REJECTED,
      ClaimStatus.WAITING_FOR_EVIDENCE,
      ClaimStatus.CANCELLED,
    ],

    AI_ANALYZING: [
      ClaimStatus.APPROVED,
      ClaimStatus.REJECTED,
      ClaimStatus.WAITING_FOR_EVIDENCE,
      ClaimStatus.CANCELLED,
    ],

    WAITING_FOR_EVIDENCE: [
      ClaimStatus.UNDER_REVIEW,
      ClaimStatus.AI_ANALYZING,
      ClaimStatus.CANCELLED,
    ],

    APPROVED: [
      ClaimStatus.RESOLVED,
      ClaimStatus.CANCELLED,
    ],

    REJECTED: [
      ClaimStatus.CLOSED,
      ClaimStatus.CANCELLED,
    ],

    RESOLVED: [
      ClaimStatus.CLOSED,
    ],

    CLOSED: [],

    CANCELLED: [],
  };

  validateTransition(
    current: ClaimStatus,
    next: ClaimStatus,
  ): void {
    if (!this.canTransition(current, next)) {
      throw new BadRequestException(
        `Invalid claim transition: ${current} → ${next}`,
      );
    }
  }

  canTransition(
    current: ClaimStatus,
    next: ClaimStatus,
  ): boolean {
    return this.transitions[
      current
    ].includes(next);
  }

  getAllowedTransitions(
    current: ClaimStatus,
  ): ClaimStatus[] {
    return this.transitions[current];
  }

  isTerminalState(
    status: ClaimStatus,
  ): boolean {
    return [
      ClaimStatus.CLOSED,
      ClaimStatus.CANCELLED,
    ].includes(status);
  }

  canReopen(
    status: ClaimStatus,
  ): boolean {
    return [
      ClaimStatus.REJECTED,
      ClaimStatus.RESOLVED,
      ClaimStatus.CLOSED,
    ].includes(status);
  }

  canAssign(
    status: ClaimStatus,
  ): boolean {
    return [
      ClaimStatus.OPEN,
      ClaimStatus.UNDER_REVIEW,
      ClaimStatus.AI_ANALYZING,
      ClaimStatus.WAITING_FOR_EVIDENCE,
    ].includes(status);
  }

  canAnalyze(
    status: ClaimStatus,
  ): boolean {
    return [
      ClaimStatus.OPEN,
      ClaimStatus.UNDER_REVIEW,
      ClaimStatus.WAITING_FOR_EVIDENCE,
    ].includes(status);
  }

  canResolve(
    status: ClaimStatus,
  ): boolean {
    return status === ClaimStatus.APPROVED;
  }

  canClose(
    status: ClaimStatus,
  ): boolean {
    return (
      status ===
        ClaimStatus.RESOLVED ||
      status ===
        ClaimStatus.REJECTED
    );
  }

  canCancel(
    status: ClaimStatus,
  ): boolean {
    return !this.isTerminalState(
      status,
    );
  }
}