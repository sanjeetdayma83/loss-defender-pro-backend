import { Module } from '@nestjs/common';
import { RecordingsService } from './recordings.service';
import { RecordingsController } from './recordings.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RecordingsController],
  providers: [RecordingsService],
  exports: [RecordingsService],
})
export class RecordingsModule {}