import {
  Injectable,
  Logger,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { AiProvider } from './ai.provider';

import {
  AIProviderRequest,
  AIProviderResponse,
} from '../types/ai.types';

@Injectable()
export class OpenAIProvider extends AiProvider {
  readonly name = 'openai';

  private readonly logger = new Logger(
    OpenAIProvider.name,
  );

  private readonly apiKey: string;

  private readonly defaultModel: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    super();

    this.apiKey =
      this.configService.get<string>(
        'OPENAI_API_KEY',
      ) ?? '';

    this.defaultModel =
      this.configService.get<string>(
        'OPENAI_MODEL',
      ) ?? 'gpt-5';
  }

  async analyze(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse> {
    this.logger.debug(
      `OpenAI analyze request (${request.jobType})`,
    );

    return this.execute(request);
  }

  async analyzeVideo(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse> {
    return this.execute(request);
  }

  async analyzeImage(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse> {
    return this.execute(request);
  }

  async analyzeBarcode(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse> {
    return this.execute(request);
  }

  async performOCR(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse> {
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

  async healthCheck(): Promise<boolean> {
    return this.apiKey.length > 0;
  }

  private async execute(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse> {
    /**
     * TODO:
     * Replace this implementation with the official
     * OpenAI Responses API integration.
     */

    return {
      provider: this.name,
      success: true,
      model:
        request.model ??
        this.defaultModel,
      confidence: 1,
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
      processingTime: 0,
      data: {},
      metadata: {},
      rawResponse: null,
    };
  }
}