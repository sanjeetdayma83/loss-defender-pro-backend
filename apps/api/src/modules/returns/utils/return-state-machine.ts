import { BadRequestException, Injectable } from '@nestjs/common';

import { ReturnStatus } from '@prisma/client';

@Injectable()
export class ReturnStateMachine {
  private readonly transitions: Record<ReturnStatus, ReturnStatus[]> = {
    DRAFT: [ReturnStatus.CREATED, ReturnStatus.CANCELLED],
    CREATED: [ReturnStatus.UNDER_REVIEW, ReturnStatus.CANCELLED],
    UNDER_REVIEW: [
      ReturnStatus.AI_ANALYZING,
      ReturnStatus.APPROVED,
      ReturnStatus.REJECTED,
      ReturnStatus.WAITING_FOR_EVIDENCE,
      ReturnStatus.CANCELLED,
    ],
    AI_ANALYZING: [
      ReturnStatus.APPROVED,
      ReturnStatus.REJECTED,
      ReturnStatus.WAITING_FOR_EVIDENCE,
      ReturnStatus.CANCELLED,
    ],
    WAITING_FOR_EVIDENCE: [
      ReturnStatus.UNDER_REVIEW,
      ReturnStatus.AI_ANALYZING,
      ReturnStatus.CANCELLED,
    ],
    APPROVED: [
      ReturnStatus.REFUNDED,
      ReturnStatus.REPLACED,
      ReturnStatus.CANCELLED,
    ],
    REFUNDED: [ReturnStatus.CLOSED],
    REPLACED: [ReturnStatus.CLOSED],
    REJECTED: [ReturnStatus.CLOSED, ReturnStatus.CANCELLED],
    CLOSED: [],
    CANCELLED: [],
  };

  validateTransition(current: ReturnStatus, next: ReturnStatus): void {
    if (!this.canTransition(current, next)) {
      throw new BadRequestException(
        `Invalid return transition: ${current} → ${next}`,
      );
    }
  }

  canTransition(current: ReturnStatus, next: ReturnStatus): boolean {
    return (this.transitions[current] ?? []).includes(next);
  }

  getAllowedTransitions(current: ReturnStatus): ReturnStatus[] {
    return this.transitions[current] ?? [];
  }

  isTerminalState(status: ReturnStatus): boolean {
    const terminal: ReturnStatus[] = [
      ReturnStatus.CLOSED,
      ReturnStatus.CANCELLED,
    ];
    return terminal.includes(status);
  }

  canAssign(status: ReturnStatus): boolean {
    const allowed: ReturnStatus[] = [
      ReturnStatus.CREATED,
      ReturnStatus.UNDER_REVIEW,
      ReturnStatus.AI_ANALYZING,
      ReturnStatus.WAITING_FOR_EVIDENCE,
    ];
    return allowed.includes(status);
  }

  canAnalyze(status: ReturnStatus): boolean {
    const allowed: ReturnStatus[] = [
      ReturnStatus.CREATED,
      ReturnStatus.UNDER_REVIEW,
      ReturnStatus.WAITING_FOR_EVIDENCE,
    ];
    return allowed.includes(status);
  }

  canApprove(status: ReturnStatus): boolean {
    return status === ReturnStatus.UNDER_REVIEW;
  }

  canReject(status: ReturnStatus): boolean {
    return status === ReturnStatus.UNDER_REVIEW;
  }

  canRefund(status: ReturnStatus): boolean {
    return status === ReturnStatus.APPROVED;
  }

  canReplace(status: ReturnStatus): boolean {
    return status === ReturnStatus.APPROVED;
  }

  canClose(status: ReturnStatus): boolean {
    const allowed: ReturnStatus[] = [
      ReturnStatus.REFUNDED,
      ReturnStatus.REPLACED,
      ReturnStatus.REJECTED,
    ];
    return allowed.includes(status);
  }

  canCancel(status: ReturnStatus): boolean {
    return !this.isTerminalState(status);
  }

  canReopen(status: ReturnStatus): boolean {
    const allowed: ReturnStatus[] = [
      ReturnStatus.REJECTED,
      ReturnStatus.REFUNDED,
      ReturnStatus.REPLACED,
      ReturnStatus.CLOSED,
    ];
    return allowed.includes(status);
  }
}
