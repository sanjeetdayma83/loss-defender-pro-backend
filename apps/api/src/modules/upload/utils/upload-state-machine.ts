import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadStatus } from '@prisma/client';

@Injectable()
export class UploadStateMachine {
  private readonly transitions: Record<UploadStatus, UploadStatus[]> = {
    PENDING: [
      UploadStatus.UPLOADING,
      UploadStatus.CANCELLED,
      UploadStatus.FAILED,
    ],

    UPLOADING: [
      UploadStatus.UPLOADED,
      UploadStatus.FAILED,
      UploadStatus.CANCELLED,
    ],

    UPLOADED: [UploadStatus.PROCESSING, UploadStatus.DELETED],

    PROCESSING: [UploadStatus.COMPLETED, UploadStatus.FAILED],

    COMPLETED: [UploadStatus.DELETED],

    FAILED: [UploadStatus.UPLOADING, UploadStatus.DELETED],

    CANCELLED: [UploadStatus.UPLOADING, UploadStatus.DELETED],

    DELETED: [],
  };

  validateTransition(current: UploadStatus, next: UploadStatus): void {
    const allowed = this.transitions[current];

    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Invalid upload status transition: ${current} → ${next}`,
      );
    }
  }

  canTransition(current: UploadStatus, next: UploadStatus): boolean {
    return this.transitions[current].includes(next);
  }

  getAllowedTransitions(current: UploadStatus): UploadStatus[] {
    return this.transitions[current];
  }
}
