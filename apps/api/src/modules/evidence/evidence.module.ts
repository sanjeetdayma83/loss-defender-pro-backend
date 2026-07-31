import { Module } from '@nestjs/common';

import { EvidenceController } from './controllers/evidence.controller';
import { EvidenceRepository } from './repositories/evidence.repository';
import { EvidenceService } from './services/evidence.service';
import { EvidenceStateMachine } from './utils/evidence-state-machine';

@Module({
  controllers: [EvidenceController],
  providers: [EvidenceRepository, EvidenceService, EvidenceStateMachine],
  exports: [EvidenceRepository, EvidenceService],
})
export class EvidenceModule {}
