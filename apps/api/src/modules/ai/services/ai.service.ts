import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { AIJob, AIJobStatus, AIProvider } from '@prisma/client';

import { AiRepository } from '../repositories/ai.repository';
import { ProviderFactory } from '../providers/provider.factory';
import { AiStateMachine } from '../utils/ai-state-machine';

import { CreateAiJobDto } from '../dto/create-ai-job.dto';
import { UpdateAiJobDto } from '../dto/update-ai-job.dto';
import { AiQueryDto } from '../dto/ai-query.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly repository: AiRepository,
    private readonly providerFactory: ProviderFactory,
    private readonly stateMachine: AiStateMachine,
  ) {}

  async create(dto: CreateAiJobDto): Promise<AIJob> {
    return this.repository.create(dto);
  }

  async findAll(query: AiQueryDto): Promise<AIJob[]> {
    return this.repository.findMany(query);
  }

  async count(query: AiQueryDto): Promise<number> {
    return this.repository.count(query);
  }

  async findOne(id: string): Promise<AIJob> {
    const job = await this.repository.findById(id);

    if (!job) {
      throw new NotFoundException('AI job not found.');
    }

    return job;
  }

  async update(id: string, dto: UpdateAiJobDto): Promise<AIJob> {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string): Promise<AIJob> {
    await this.findOne(id);
    return this.repository.softDelete(id);
  }

  async execute(id: string): Promise<AIJob> {
    const job = await this.findOne(id);

    this.stateMachine.validateTransition(job.status, AIJobStatus.PROCESSING);

    await this.repository.markStarted(id);

    const startedAt = Date.now();

    try {
      const providerKey = (job.provider ?? 'LOCAL')
        .toString()
        .toUpperCase() as AIProvider;

      const provider = this.providerFactory.getProvider(providerKey);

      const result = await provider.analyze({
        provider: providerKey,
        model: job.model ?? undefined,
        prompt: job.prompt ?? undefined,
        input: job.input ?? undefined,
      });

      const processingTime = Date.now() - startedAt;
      const confidence =
        typeof result.confidence === 'number' ? result.confidence : 0;
      const tokensUsed =
        result.usage?.totalTokens ?? result.tokensUsed ?? undefined;

      return this.repository.markCompleted(
        id,
        result.data ?? result,
        confidence,
        processingTime,
        tokensUsed,
      );
    } catch (error) {
      await this.repository.markFailed(
        id,
        error instanceof Error ? error.message : 'Unknown AI error',
      );
      throw error;
    }
  }

  async retry(id: string): Promise<AIJob> {
    const job = await this.findOne(id);

    if (!this.stateMachine.canRetry(job.status)) {
      throw new Error('This AI job cannot be retried.');
    }

    await this.repository.updateStatus(id, AIJobStatus.PENDING);
    return this.execute(id);
  }

  async updateStatus(id: string, status: AIJobStatus): Promise<AIJob> {
    const job = await this.findOne(id);
    this.stateMachine.validateTransition(job.status, status);
    return this.repository.updateStatus(id, status);
  }

  getProvider(provider: AIProvider) {
    return this.providerFactory.getProvider(provider);
  }

  async healthCheck() {
    return this.providerFactory.healthCheck();
  }
}
