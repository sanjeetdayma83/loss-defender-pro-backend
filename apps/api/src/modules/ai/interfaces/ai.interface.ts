import {
  AIProviderRequest,
  AIProviderResponse,
} from '../types/ai.types';

export interface IAIProvider {
  readonly name: string;

  analyze(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse>;

  analyzeVideo(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse>;

  analyzeImage(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse>;

  analyzeBarcode(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse>;

  performOCR(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse>;

  validateEvidence(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse>;

  generateReport(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse>;

  healthCheck(): Promise<boolean>;
}