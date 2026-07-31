import { Module } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { ClaimsController } from './controllers/claims.controller';

import { ClaimRepository } from './repositories/claim.repository';

import { ClaimService } from './services/claim.service';

import { ClaimStateMachine } from './utils/claim-state-machine';

@Module({
  controllers: [ClaimsController],
  providers: [PrismaService, ClaimRepository, ClaimService, ClaimStateMachine],
  exports: [ClaimService, ClaimRepository],
})
export class ClaimsModule {}
