import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

import { PrismaService } from '../../database/prisma.service';

import { ClaimsController } from './controllers/claims.controller';

import { ClaimRepository } from './repositories/claim.repository';

import { ClaimService } from './services/claim.service';

import { ClaimStateMachine } from './utils/claim-state-machine';

@Module({
  imports: [AuthModule],
  controllers: [ClaimsController],
  providers: [PrismaService, ClaimRepository, ClaimService, ClaimStateMachine],
  exports: [ClaimService, ClaimRepository],
})
export class ClaimsModule {}

