import {
  Injectable,
} from '@nestjs/common';

import {
  AIProviderRequest,
  AIProviderResponse,
} from '../types/ai.types';

import {
  IAIProvider,
} from '../interfaces/ai.interface';

@Injectable()
export abstract class AiProvider
  implements IAIProvider
{
  abstract readonly name: string;

  abstract analyze(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse>;

  abstract analyzeVideo(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse>;

  abstract analyzeImage(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse>;

  abstract analyzeBarcode(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse>;

  abstract performOCR(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse>;

  abstract validateEvidence(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse>;

  abstract generateReport(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse>;

  abstract healthCheck(): Promise<boolean>;
}