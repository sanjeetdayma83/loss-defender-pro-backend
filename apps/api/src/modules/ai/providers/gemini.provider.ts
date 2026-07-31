import { Injectable, Logger } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { AIProvider } from '@prisma/client';
import { AiProvider } from './ai.provider';

import { AIProviderRequest, AIProviderResponse } from '../types/ai.types';

@Injectable()
export class GeminiProvider extends AiProvider {
  readonly name = AIProvider.GEMINI;

  private readonly logger = new Logger(GeminiProvider.name);

  private readonly apiKey: string;

  private readonly defaultModel: string;

  constructor(private readonly configService: ConfigService) {
    super();

    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') ?? '';

    this.defaultModel =
      this.configService.get<string>('GEMINI_MODEL') ?? 'gemini-2.5-pro';
  }

  async analyze(request: AIProviderRequest): Promise<AIProviderResponse> {
    this.logger.debug('Gemini analyze request');

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
    return Promise.resolve(this.apiKey.length > 0);
  }

  private execute(request: AIProviderRequest): Promise<AIProviderResponse> {
    /**
     * TODO:
     * Replace this implementation with the official
     * Google Gemini SDK integration.
     */

    return Promise.resolve({
      success: true,

      provider: this.name,

      model: request.model ?? this.defaultModel,

      confidence: 1,

      processingTime: 0,

      data: {},

      result: {},

      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    });
  }
}
