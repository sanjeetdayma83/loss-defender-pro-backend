import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

import { PrismaModule } from '../../database/prisma.module';

import { RecordingController } from './controllers/recording.controller';
import { RecordingRepository } from './repositories/recording.repository';
import { RecordingService } from './services/recording.service';
import { RecordingStateMachine } from './utils/recording-state-machine';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RecordingController],
  providers: [RecordingRepository, RecordingService, RecordingStateMachine],
  exports: [RecordingRepository, RecordingService, RecordingStateMachine],
})
export class RecordingModule {}

