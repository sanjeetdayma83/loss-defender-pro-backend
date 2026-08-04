import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

import { PrismaService } from '../../database/prisma.service';

import { ReturnsController } from './controllers/returns.controller';
import { ReturnRepository } from './repositories/return.repository';
import { ReturnService } from './services/return.service';
import { ReturnStateMachine } from './utils/return-state-machine';

@Module({
  imports: [AuthModule],
  controllers: [ReturnsController],
  providers: [
    PrismaService,
    ReturnRepository,
    ReturnService,
    ReturnStateMachine,
  ],
  exports: [ReturnRepository, ReturnService, ReturnStateMachine],
})
export class ReturnsModule {}

