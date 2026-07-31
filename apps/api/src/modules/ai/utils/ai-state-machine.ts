import { BadRequestException, Injectable } from '@nestjs/common';

import { AIJobStatus } from '@prisma/client';

@Injectable()
export class AiStateMachine {
  private readonly transitions: Record<AIJobStatus, AIJobStatus[]> = {
    [AIJobStatus.PENDING]: [
      AIJobStatus.QUEUED,
      AIJobStatus.PROCESSING,
      AIJobStatus.CANCELLED,
    ],
    [AIJobStatus.QUEUED]: [AIJobStatus.PROCESSING, AIJobStatus.CANCELLED],
    [AIJobStatus.PROCESSING]: [AIJobStatus.COMPLETED, AIJobStatus.FAILED],
    [AIJobStatus.COMPLETED]: [],
    [AIJobStatus.FAILED]: [AIJobStatus.PENDING],
    [AIJobStatus.CANCELLED]: [],
  };

  validateTransition(current: AIJobStatus, next: AIJobStatus): void {
    const allowed = this.transitions[current] ?? [];

    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Invalid AI job transition: ${current} → ${next}`,
      );
    }
  }

  canTransition(current: AIJobStatus, next: AIJobStatus): boolean {
    return (this.transitions[current] ?? []).includes(next);
  }

  getAllowedTransitions(current: AIJobStatus): AIJobStatus[] {
    return this.transitions[current] ?? [];
  }

  isTerminalState(status: AIJobStatus): boolean {
    return (
      status === AIJobStatus.COMPLETED ||
      status === AIJobStatus.FAILED ||
      status === AIJobStatus.CANCELLED
    );
  }

  canRetry(status: AIJobStatus): boolean {
    return status === AIJobStatus.FAILED;
  }
}
