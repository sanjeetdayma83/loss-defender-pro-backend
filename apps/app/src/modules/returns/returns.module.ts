import { Module } from '@nestjs/common';
import { ReturnsController } from './controllers/returns.controller';
import { ReturnRepository } from './repositories/return.repository';
import { ReturnService } from './services/return.service';
import { ReturnStateMachine } from './utils/return-state-machine';

@Module({
  controllers: [ReturnsController],
  providers: [ReturnRepository, ReturnService, ReturnStateMachine],
  exports: [ReturnRepository, ReturnService, ReturnStateMachine],
})
export class ReturnsModule {}
