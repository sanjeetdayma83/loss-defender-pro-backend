import { BadRequestException, Injectable } from '@nestjs/common';
import { RecordingStatus } from '@prisma/client';

@Injectable()
export class RecordingStateMachine {
  private readonly transitions: Record<RecordingStatus, RecordingStatus[]> = {
    CREATED: [RecordingStatus.STARTED, RecordingStatus.FAILED],

    STARTED: [
      RecordingStatus.PAUSED,
      RecordingStatus.STOPPED,
      RecordingStatus.FAILED,
    ],

    PAUSED: [
      RecordingStatus.RESUMED,
      RecordingStatus.STOPPED,
      RecordingStatus.FAILED,
    ],

    RESUMED: [
      RecordingStatus.PAUSED,
      RecordingStatus.STOPPED,
      RecordingStatus.FAILED,
    ],

    STOPPED: [RecordingStatus.UPLOADING, RecordingStatus.FAILED],

    UPLOADING: [RecordingStatus.UPLOADED, RecordingStatus.FAILED],

    UPLOADED: [RecordingStatus.PROCESSING, RecordingStatus.FAILED],

    PROCESSING: [RecordingStatus.COMPLETED, RecordingStatus.FAILED],

    COMPLETED: [],

    FAILED: [],
  };

  canTransition(current: RecordingStatus, next: RecordingStatus): boolean {
    return this.transitions[current]?.includes(next) ?? false;
  }

  validateTransition(current: RecordingStatus, next: RecordingStatus): void {
    if (!this.canTransition(current, next)) {
      throw new BadRequestException(
        `Invalid recording status transition: ${current} -> ${next}`,
      );
    }
  }
}
