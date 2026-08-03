import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './controllers/ai.controller';
import { AiRepository } from './repositories/ai.repository';
import { AiService } from './services/ai.service';
import { AiStateMachine } from './utils/ai-state-machine';
import { ProviderFactory } from './providers/provider.factory';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { LocalProvider } from './providers/local.provider';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [
    AiRepository,
    AiService,
    AiStateMachine,
    ProviderFactory,
    GeminiProvider,
    OpenAIProvider,
    LocalProvider,
  ],
  exports: [AiService, AiRepository, ProviderFactory],
})
export class AiModule {}
