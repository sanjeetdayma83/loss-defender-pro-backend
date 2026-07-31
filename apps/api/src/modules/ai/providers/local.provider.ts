import { Injectable, Logger } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { AIProvider } from '@prisma/client';
import { AiProvider } from './ai.provider';

import { AIProviderRequest, AIProviderResponse } from '../types/ai.types';

@Injectable()
export class LocalProvider extends AiProvider {
  readonly name = AIProvider.LOCAL;

  private readonly logger = new Logger(LocalProvider.name);

  private readonly baseUrl: string;

  private readonly defaultModel: string;

  constructor(private readonly configService: ConfigService) {
    super();

    this.baseUrl =
      this.configService.get<string>('LOCAL_AI_BASE_URL') ??
      'http://localhost:11434';

    this.defaultModel =
      this.configService.get<string>('LOCAL_AI_MODEL') ?? 'llama3';
  }

  async analyze(request: AIProviderRequest): Promise<AIProviderResponse> {
    this.logger.debug(`Local AI analyze request (${request.provider})`);
    return this.execute(request);
  }

  async analyzeVideo(request: AIProviderRequest): Promise<AIProviderResponse> {
    return this.execute(request);
  }

  async analyzeImage(request: AIProviderRequest): Promise<AIProviderResponse> {
    return this.execute(request);
  }

  async analyzeBarcode(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse> {
    return this.execute(request);
  }

  async performOCR(request: AIProviderRequest): Promise<AIProviderResponse> {
    return this.execute(request);
  }

  async validateEvidence(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse> {
    return this.execute(request);
  }

  async generateReport(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse> {
    return this.execute(request);
  }

  healthCheck(): Promise<boolean> {
    return Promise.resolve(this.baseUrl.length > 0);
  }

  private execute(request: AIProviderRequest): Promise<AIProviderResponse> {
    /**
     * TODO:
     * Replace this implementation with an actual
     * Ollama / Local LLM / vLLM / LM Studio API call.
     */

    return Promise.resolve({
      success: true,

      provider: this.name,

      model: request.model ?? this.defaultModel,

      confidence: 1,

      processingTime: 0,

      data: {
        endpoint: this.baseUrl,
      },

      result: {
        endpoint: this.baseUrl,
      },

      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    });
  }
}
