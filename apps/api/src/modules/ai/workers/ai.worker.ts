import {
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  AiService,
} from '../services/ai.service';

@Injectable()
export class AiWorker {
  private readonly logger = new Logger(
    AiWorker.name,
  );

  constructor(
    private readonly aiService: AiService,
  ) {}

  /**
   * Process an AI job.
   *
   * This method is intentionally transport-agnostic.
   * It can later be wired to:
   * - BullMQ
   * - RabbitMQ
   * - Kafka
   * - AWS SQS
   * - Google Pub/Sub
   * - Azure Service Bus
   */
  async process(
    jobId: string,
  ): Promise<void> {
    this.logger.log(
      `Processing AI job: ${jobId}`,
    );

    try {
      await this.aiService.execute(
        jobId,
      );

      this.logger.log(
        `AI job completed: ${jobId}`,
      );
    } catch (error) {
      this.logger.error(
        `AI job failed: ${jobId}`,
        error instanceof Error
          ? error.stack
          : undefined,
      );

      throw error;
    }
  }

  /**
   * Retry a failed AI job.
   */
  async retry(
    jobId: string,
  ): Promise<void> {
    this.logger.warn(
      `Retrying AI job: ${jobId}`,
    );

    await this.aiService.retry(
      jobId,
    );
  }

  /**
   * Health probe for worker.
   */
  async healthCheck(): Promise<{
    status: string;
    timestamp: Date;
  }> {
    return {
      status: 'healthy',
      timestamp: new Date(),
    };
  }
}