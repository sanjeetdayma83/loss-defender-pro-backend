import { Injectable, NotFoundException } from '@nestjs/common';
import { Evidence, EvidenceStatus, Prisma } from '@prisma/client';

import { CreateEvidenceDto } from '../dto/create-evidence.dto';
import { EvidenceQueryDto } from '../dto/evidence-query.dto';
import { UpdateEvidenceDto } from '../dto/update-evidence.dto';
import { EvidenceRepository } from '../repositories/evidence.repository';
import { EvidenceStateMachine } from '../utils/evidence-state-machine';

@Injectable()
export class EvidenceService {
  constructor(
    private readonly evidenceRepository: EvidenceRepository,
    private readonly stateMachine: EvidenceStateMachine,
  ) {}

  async create(dto: CreateEvidenceDto): Promise<Evidence> {
    return this.evidenceRepository.create({
      company: {
        connect: {
          id: dto.companyId,
        },
      },
      warehouse: {
        connect: {
          id: dto.warehouseId,
        },
      },
      order: {
        connect: {
          id: dto.orderId,
        },
      },
      recording: {
        connect: {
          id: dto.recordingId,
        },
      },
      status: dto.status ?? EvidenceStatus.CREATED,

      metadata: dto.metadata
        ? (JSON.parse(dto.metadata) as Prisma.InputJsonValue)
        : Prisma.JsonNull,
    });
  }

  async findById(id: string): Promise<Evidence> {
    const evidence = await this.evidenceRepository.findById(id);

    if (!evidence) {
      throw new NotFoundException('Evidence not found');
    }

    return evidence;
  }

  async findAll(query: EvidenceQueryDto): Promise<Evidence[]> {
    return this.evidenceRepository.findAll({
      where: {
        companyId: query.companyId,
        warehouseId: query.warehouseId,
        orderId: query.orderId,
        recordingId: query.recordingId,
        status: query.status,
        isDeleted: false,
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: {
        [query.sortBy]: query.sortOrder,
      },
    });
  }

  async update(id: string, dto: UpdateEvidenceDto): Promise<Evidence> {
    await this.findById(id);

    return this.evidenceRepository.update(id, dto);
  }

  async delete(id: string): Promise<Evidence> {
    await this.findById(id);

    return this.evidenceRepository.softDelete(id);
  }

  async changeStatus(id: string, status: EvidenceStatus): Promise<Evidence> {
    const evidence = await this.findById(id);

    this.stateMachine.validateTransition(evidence.status, status);

    return this.evidenceRepository.update(id, {
      status,
    });
  }

  async startGeneration(id: string): Promise<Evidence> {
    return this.changeStatus(id, EvidenceStatus.GENERATING);
  }

  async markGenerated(id: string): Promise<Evidence> {
    return this.changeStatus(id, EvidenceStatus.GENERATED);
  }

  async verify(id: string): Promise<Evidence> {
    return this.changeStatus(id, EvidenceStatus.VERIFIED);
  }

  async archive(id: string): Promise<Evidence> {
    return this.changeStatus(id, EvidenceStatus.ARCHIVED);
  }

  async fail(id: string): Promise<Evidence> {
    return this.changeStatus(id, EvidenceStatus.FAILED);
  }
}
