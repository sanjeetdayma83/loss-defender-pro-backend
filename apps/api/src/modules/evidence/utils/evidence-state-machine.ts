import { BadRequestException, Injectable } from '@nestjs/common';
import { EvidenceStatus } from '@prisma/client';

@Injectable()
export class EvidenceStateMachine {
  private readonly transitions: Record<EvidenceStatus, EvidenceStatus[]> = {
    CREATED: [EvidenceStatus.GENERATING, EvidenceStatus.FAILED],

    GENERATING: [EvidenceStatus.GENERATED, EvidenceStatus.FAILED],

    GENERATED: [EvidenceStatus.VERIFIED, EvidenceStatus.FAILED],

    VERIFIED: [EvidenceStatus.ARCHIVED],

    ARCHIVED: [],

    FAILED: [],
  };

  validateTransition(current: EvidenceStatus, next: EvidenceStatus): void {
    const allowed = this.transitions[current] ?? [];

    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Invalid evidence status transition: ${current} -> ${next}`,
      );
    }
  }

  canTransition(current: EvidenceStatus, next: EvidenceStatus): boolean {
    return (this.transitions[current] ?? []).includes(next);
  }

  getAllowedTransitions(current: EvidenceStatus): EvidenceStatus[] {
    return this.transitions[current] ?? [];
  }
}
