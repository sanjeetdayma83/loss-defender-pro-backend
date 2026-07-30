import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import {
  AIJobStatus,
} from '@prisma/client';

@Injectable()
export class AiStateMachine {
  private readonly transitions: Record<
    AIJobStatus,
    AIJobStatus[]
  > = {
    PENDING: [
      AIJobStatus.PROCESSING,
      AIJobStatus.CANCELLED,
      AIJobStatus.FAILED,
    ],

    PROCESSING: [
      AIJobStatus.COMPLETED,
      AIJobStatus.FAILED,
      AIJobStatus.CANCELLED,
    ],

    COMPLETED: [],

    FAILED: [
      AIJobStatus.PENDING,
    ],

    CANCELLED: [
      AIJobStatus.PENDING,
    ],
  };

  validateTransition(
    current: AIJobStatus,
    next: AIJobStatus,
  ): void {
    const allowed =
      this.transitions[current];

    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Invalid AI job transition: ${current} → ${next}`,
      );
    }
  }

  canTransition(
    current: AIJobStatus,
    next: AIJobStatus,
  ): boolean {
    return this.transitions[
      current
    ].includes(next);
  }

  getAllowedTransitions(
    current: AIJobStatus,
  ): AIJobStatus[] {
    return this.transitions[current];
  }

  isTerminalState(
    status: AIJobStatus,
  ): boolean {
    return (
      status ===
        AIJobStatus.COMPLETED ||
      status ===
        AIJobStatus.FAILED ||
      status ===
        AIJobStatus.CANCELLED
    );
  }

  canRetry(
    status: AIJobStatus,
  ): boolean {
    return (
      status ===
        AIJobStatus.FAILED ||
      status ===
        AIJobStatus.CANCELLED
    );
  }
}