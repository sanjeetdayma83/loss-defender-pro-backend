import { Module } from '@nestjs/common';
import { RecordingsService } from './recordings.service';
import { RecordingsController } from './recordings.controller';
import { StorageModule } from '../storage/storage.module';
import { EvidenceModule } from '../evidence/evidence.module';

@Module({
  imports: [StorageModule, EvidenceModule],
  controllers: [RecordingsController],
  providers: [RecordingsService],
  exports: [RecordingsService],
})
export class RecordingsModule {}
