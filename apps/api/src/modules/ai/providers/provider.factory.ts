import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  AIProvider,
} from '@prisma/client';

import { AiProvider } from './ai.provider';
import { GeminiProvider } from './gemini.provider';
import { OpenAIProvider } from './openai.provider';
import { LocalProvider } from './local.provider';

@Injectable()
export class ProviderFactory {
  constructor(
    private readonly geminiProvider: GeminiProvider,
    private readonly openAIProvider: OpenAIProvider,
    private readonly localProvider: LocalProvider,
  ) {}

  getProvider(
    provider: AIProvider,
  ): AiProvider {
    switch (provider) {
      case AIProvider.GEMINI:
        return this.geminiProvider;

      case AIProvider.OPENAI:
        return this.openAIProvider;

      case AIProvider.LOCAL:
        return this.localProvider;

      default:
        throw new NotFoundException(
          `Unsupported AI provider: ${provider}`,
        );
    }
  }

  getDefaultProvider(): AiProvider {
    return this.geminiProvider;
  }

  getAvailableProviders(): AIProvider[] {
    return [
      AIProvider.GEMINI,
      AIProvider.OPENAI,
      AIProvider.LOCAL,
    ];
  }

  async healthCheck(): Promise<
    Record<AIProvider, boolean>
  > {
    return {
      [AIProvider.GEMINI]:
        await this.geminiProvider.healthCheck(),

      [AIProvider.OPENAI]:
        await this.openAIProvider.healthCheck(),

      [AIProvider.LOCAL]:
        await this.localProvider.healthCheck(),
    };
  }
}