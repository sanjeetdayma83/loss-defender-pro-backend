import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Claim,
  ClaimPriority,
  ClaimResolutionType,
  ClaimStatus,
} from '@prisma/client';

import { Prisma } from '@prisma/client';
import { CreateClaimDto } from '../dto/create-claim.dto';
import { UpdateClaimDto } from '../dto/update-claim.dto';
import { ClaimQueryDto } from '../dto/claim-query.dto';
import { ClaimRepository } from '../repositories/claim.repository';
import { ClaimStateMachine } from '../utils/claim-state-machine';

@Injectable()
export class ClaimService {
  constructor(
    private readonly repository: ClaimRepository,
    private readonly stateMachine: ClaimStateMachine,
  ) {}

  async create(
    dto: CreateClaimDto,
  ): Promise<Claim> {
    const claimNumber =
      await this.generateClaimNumber();

    return this.repository.create({
      ...dto,
      claimNumber,
    });
  }

  async findAll(
    query: ClaimQueryDto,
  ) {
    const data =
      await this.repository.findAll(
        query,
      );

    const total =
      await this.repository.count();

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async findById(
    id: string,
  ): Promise<Claim> {
    const claim =
      await this.repository.findById(id);

    if (!claim) {
      throw new NotFoundException(
        'Claim not found.',
      );
    }

    return claim;
  }

  async update(
    id: string,
    dto: UpdateClaimDto,
  ): Promise<Claim> {
    await this.findById(id);

    return this.repository.update(
      id,
      dto,
    );
  }

  async remove(
    id: string,
  ): Promise<Claim> {
    await this.findById(id);

    return this.repository.softDelete(
      id,
    );
  }

  async changeStatus(
    id: string,
    status: ClaimStatus,
  ): Promise<Claim> {
    const claim =
      await this.findById(id);

    this.stateMachine.validateTransition(
      claim.status,
      status,
    );

    return this.repository.updateStatus(
      id,
      status,
    );
  }

  async changePriority(
    id: string,
    priority: ClaimPriority,
  ): Promise<Claim> {
    await this.findById(id);

    return this.repository.updatePriority(
      id,
      priority,
    );
  }

  async assign(
    id: string,
    assignedTo: string,
  ): Promise<Claim> {
    const claim =
      await this.findById(id);

    if (
      !this.stateMachine.canAssign(
        claim.status,
      )
    ) {
      throw new BadRequestException(
        'Claim cannot be assigned in its current state.',
      );
    }

    return this.repository.assign(
      id,
      assignedTo,
    );
  }

  async analyze(
    id: string,
  ): Promise<Claim> {
    const claim =
      await this.findById(id);

    if (
      !this.stateMachine.canAnalyze(
        claim.status,
      )
    ) {
      throw new BadRequestException(
        'Claim is not eligible for AI analysis.',
      );
    }

    return this.repository.updateStatus(
      id,
      ClaimStatus.AI_ANALYZING,
    );
  }

  async validateEvidence(
    id: string,
  ): Promise<boolean> {
    await this.findById(id);

    // Future implementation:
    // Validate recordings, uploads,
    // AI output and evidence chain.

    return true;
  }

  async resolve(
    id: string,
    resolutionType: ClaimResolutionType,
    resolvedBy: string,
    resolutionData?: Prisma.JsonValue,
  ): Promise<Claim> {
    const claim =
      await this.findById(id);

    if (
      !this.stateMachine.canResolve(
        claim.status,
      )
    ) {
      throw new BadRequestException(
        'Claim cannot be resolved.',
      );
    }

    return this.repository.resolve(
      id,
      resolutionType,
      resolvedBy,
      resolutionData,
    );
  }

  async close(
    id: string,
  ): Promise<Claim> {
    const claim =
      await this.findById(id);

    if (
      !this.stateMachine.canClose(
        claim.status,
      )
    ) {
      throw new BadRequestException(
        'Claim cannot be closed.',
      );
    }

    return this.repository.close(id);
  }

  async reopen(
    id: string,
  ): Promise<Claim> {
    const claim =
      await this.findById(id);

    if (
      !this.stateMachine.canReopen(
        claim.status,
      )
    ) {
      throw new BadRequestException(
        'Claim cannot be reopened.',
      );
    }

    return this.repository.updateStatus(
      id,
      ClaimStatus.OPEN,
    );
  }

  async cancel(
    id: string,
  ): Promise<Claim> {
    const claim =
      await this.findById(id);

    if (
      !this.stateMachine.canCancel(
        claim.status,
      )
    ) {
      throw new BadRequestException(
        'Claim cannot be cancelled.',
      );
    }

    return this.repository.updateStatus(
      id,
      ClaimStatus.CANCELLED,
    );
  }

  async escalate(
    id: string,
  ): Promise<Claim> {
    const claim =
      await this.findById(id);

    return this.repository.updatePriority(
      id,
      ClaimPriority.HIGH,
    );
  }

  async generateResolution(
    id: string,
  ) {
    await this.findById(id);

    return {
      success: true,
      message:
        'AI-generated resolution will be available in a future release.',
    };
  }

  async getStatistics() {
    return this.repository.statistics();
  }

  private async generateClaimNumber(): Promise<string> {
    while (true) {
      const number = `CLM-${Date.now()}-${Math.floor(
        Math.random() * 1000,
      )}`;

      const exists =
        await this.repository.findByClaimNumber(
          number,
        );

      if (!exists) {
        return number;
      }
    }
  }
}