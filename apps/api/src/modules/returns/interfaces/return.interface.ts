import {
  Return,
  ReturnPriority,
  ReturnResolutionType,
  ReturnStatus,
} from '@prisma/client';

import { CreateReturnDto } from '../dto/create-return.dto';
import { ReturnQueryDto } from '../dto/return-query.dto';
import { UpdateReturnDto } from '../dto/update-return.dto';

export interface IReturnService {
  create(dto: CreateReturnDto): Promise<Return>;

  update(id: string, dto: UpdateReturnDto): Promise<Return>;

  remove(id: string): Promise<Return>;

  findById(id: string): Promise<Return>;

  findAll(query: ReturnQueryDto): Promise<{
    data: Return[];
    total: number;
    page: number;
    limit: number;
  }>;

  changeStatus(id: string, status: ReturnStatus): Promise<Return>;

  changePriority(id: string, priority: ReturnPriority): Promise<Return>;

  assign(id: string, assignedTo: string): Promise<Return>;

  analyze(id: string): Promise<Return>;

  validateEvidence(id: string): Promise<boolean>;

  approve(id: string): Promise<Return>;

  reject(id: string, reason?: string): Promise<Return>;

  refund(
    id: string,
    resolutionType: ReturnResolutionType,
    refundedBy: string,
    refundData?: Record<string, unknown>,
  ): Promise<Return>;

  replace(
    id: string,
    resolutionType: ReturnResolutionType,
    processedBy: string,
    replacementData?: Record<string, unknown>,
  ): Promise<Return>;

  close(id: string): Promise<Return>;

  reopen(id: string): Promise<Return>;

  cancel(id: string): Promise<Return>;

  escalate(id: string): Promise<Return>;

  generateResolution(id: string): Promise<{
    success: boolean;
    message: string;
  }>;

  getStatistics(): Promise<unknown>;
}
