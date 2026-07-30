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
export class LocalProvider extends AiProvider {
  readonly name = 'local';

  private readonly logger = new Logger(
    LocalProvider.name,
  );

  private readonly baseUrl: string;

  private readonly defaultModel: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    super();

    this.baseUrl =
      this.configService.get<string>(
        'LOCAL_AI_BASE_URL',
      ) ?? 'http://localhost:11434';

    this.defaultModel =
      this.configService.get<string>(
        'LOCAL_AI_MODEL',
      ) ?? 'llama3';
  }

  async analyze(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse> {
    this.logger.debug(
      `Local AI analyze request (${request.jobType})`,
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
    return this.baseUrl.length > 0;
  }

  private async execute(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse> {
    /**
     * TODO:
     * Replace this implementation with an actual
     * Ollama / Local LLM / vLLM / LM Studio API call.
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
      metadata: {
        endpoint: this.baseUrl,
      },
      rawResponse: null,
    };
  }
}