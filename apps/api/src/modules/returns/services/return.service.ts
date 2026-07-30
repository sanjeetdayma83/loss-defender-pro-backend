import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Return,
  ReturnPriority,
  ReturnResolutionType,
  ReturnStatus,
} from '@prisma/client';

import { CreateReturnDto } from '../dto/create-return.dto';
import { ReturnQueryDto } from '../dto/return-query.dto';
import { UpdateReturnDto } from '../dto/update-return.dto';
import { ReturnRepository } from '../repositories/return.repository';
import { ReturnStateMachine } from '../utils/return-state-machine';

@Injectable()
export class ReturnService {
  constructor(
    private readonly repository: ReturnRepository,
    private readonly stateMachine: ReturnStateMachine,
  ) {}

  async create(
    dto: CreateReturnDto,
  ): Promise<Return> {
    const returnNumber =
      await this.generateReturnNumber();

    return this.repository.create({
      ...dto,
      returnNumber,
    });
  }

  async findAll(
    query: ReturnQueryDto,
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
  ): Promise<Return> {
    const record =
      await this.repository.findById(id);

    if (!record) {
      throw new NotFoundException(
        'Return not found.',
      );
    }

    return record;
  }

  async update(
    id: string,
    dto: UpdateReturnDto,
  ): Promise<Return> {
    await this.findById(id);

    return this.repository.update(
      id,
      dto,
    );
  }

  async remove(
    id: string,
  ): Promise<Return> {
    await this.findById(id);

    return this.repository.softDelete(
      id,
    );
  }

  async changeStatus(
    id: string,
    status: ReturnStatus,
  ): Promise<Return> {
    const record =
      await this.findById(id);

    this.stateMachine.validateTransition(
      record.status,
      status,
    );

    return this.repository.updateStatus(
      id,
      status,
    );
  }

  async changePriority(
    id: string,
    priority: ReturnPriority,
  ): Promise<Return> {
    await this.findById(id);

    return this.repository.updatePriority(
      id,
      priority,
    );
  }

  async assign(
    id: string,
    assignedTo: string,
  ): Promise<Return> {
    const record =
      await this.findById(id);

    if (
      !this.stateMachine.canAssign(
        record.status,
      )
    ) {
      throw new BadRequestException(
        'Return cannot be assigned in its current state.',
      );
    }

    return this.repository.assign(
      id,
      assignedTo,
    );
  }

  async analyze(
    id: string,
  ): Promise<Return> {
    const record =
      await this.findById(id);

    if (
      !this.stateMachine.canAnalyze(
        record.status,
      )
    ) {
      throw new BadRequestException(
        'Return is not eligible for AI analysis.',
      );
    }

    return this.repository.updateStatus(
      id,
      ReturnStatus.AI_ANALYZING,
    );
  }

  async validateEvidence(
    id: string,
  ): Promise<boolean> {
    await this.findById(id);

    // Future:
    // Validate recordings,
    // uploads,
    // evidence,
    // AI analysis.

    return true;
  }

  async approve(
    id: string,
  ): Promise<Return> {
    const record =
      await this.findById(id);

    if (
      !this.stateMachine.canApprove(
        record.status,
      )
    ) {
      throw new BadRequestException(
        'Return cannot be approved.',
      );
    }

    return this.repository.updateStatus(
      id,
      ReturnStatus.APPROVED,
    );
  }

  async reject(
    id: string,
    reason?: string,
  ): Promise<Return> {
    const record =
      await this.findById(id);

    if (
      !this.stateMachine.canReject(
        record.status,
      )
    ) {
      throw new BadRequestException(
        'Return cannot be rejected.',
      );
    }

    return this.repository.update(
      id,
      {
        internalRemarks: reason,
        status:
          ReturnStatus.REJECTED,
      },
    );
  }

  async refund(
    id: string,
    resolutionType: ReturnResolutionType,
    refundedBy: string,
    refundData?: Record<
      string,
      unknown
    >,
  ): Promise<Return> {
    const record =
      await this.findById(id);

    if (
      !this.stateMachine.canRefund(
        record.status,
      )
    ) {
      throw new BadRequestException(
        'Return cannot be refunded.',
      );
    }

    return this.repository.processRefund(
      id,
      resolutionType,
      refundedBy,
      record.refundAmount ?? 0,
      record.refundCurrency ??
        'USD',
      refundData,
    );
  }

  async replace(
    id: string,
    resolutionType: ReturnResolutionType,
    processedBy: string,
    replacementData?: Record<
      string,
      unknown
    >,
  ): Promise<Return> {
    const record =
      await this.findById(id);

    if (
      !this.stateMachine.canReplace(
        record.status,
      )
    ) {
      throw new BadRequestException(
        'Return cannot be replaced.',
      );
    }

    return this.repository.processReplacement(
      id,
      resolutionType,
      processedBy,
      record.replacementOrderId ??
        '',
      record.replacementTrackingNumber ??
        undefined,
      replacementData,
    );
  }

  async close(
    id: string,
  ): Promise<Return> {
    const record =
      await this.findById(id);

    if (
      !this.stateMachine.canClose(
        record.status,
      )
    ) {
      throw new BadRequestException(
        'Return cannot be closed.',
      );
    }

    return this.repository.close(id);
  }

  async reopen(
    id: string,
  ): Promise<Return> {
    const record =
      await this.findById(id);

    if (
      !this.stateMachine.canReopen(
        record.status,
      )
    ) {
      throw new BadRequestException(
        'Return cannot be reopened.',
      );
    }

    return this.repository.updateStatus(
      id,
      ReturnStatus.CREATED,
    );
  }

  async cancel(
    id: string,
  ): Promise<Return> {
    const record =
      await this.findById(id);

    if (
      !this.stateMachine.canCancel(
        record.status,
      )
    ) {
      throw new BadRequestException(
        'Return cannot be cancelled.',
      );
    }

    return this.repository.updateStatus(
      id,
      ReturnStatus.CANCELLED,
    );
  }

  async escalate(
    id: string,
  ): Promise<Return> {
    await this.findById(id);

    return this.repository.updatePriority(
      id,
      ReturnPriority.HIGH,
    );
  }

  async generateResolution(
    id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
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

  private async generateReturnNumber(): Promise<string> {
    while (true) {
      const number = `RTN-${Date.now()}-${Math.floor(
        Math.random() * 1000,
      )}`;

      const exists =
        await this.repository.findByReturnNumber(
          number,
        );

      if (!exists) {
        return number;
      }
    }
  }
}