import { Module } from '@nestjs/common';
import { ClaimsController } from './controllers/claims.controller';
import { ClaimRepository } from './repositories/claim.repository';
import { ClaimService } from './services/claim.service';
import { ClaimStateMachine } from './utils/claim-state-machine';

@Module({
  controllers: [ClaimsController],
  providers: [ClaimRepository, ClaimService, ClaimStateMachine],
  exports: [ClaimService, ClaimRepository],
})
export class ClaimsModule {}
