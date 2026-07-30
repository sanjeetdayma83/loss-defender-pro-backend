import {
  Evidence,
  EvidenceStatus,
  Prisma,
} from '@prisma/client';

export type EvidenceModel = Evidence;

export type EvidenceCreateInput =
  Prisma.EvidenceCreateInput;

export type EvidenceUpdateInput =
  Prisma.EvidenceUpdateInput;

export type EvidenceWhereInput =
  Prisma.EvidenceWhereInput;

export type EvidenceOrderByInput =
  Prisma.EvidenceOrderByWithRelationInput;

export type EvidenceFindManyArgs =
  Prisma.EvidenceFindManyArgs;

export type EvidenceFindUniqueArgs =
  Prisma.EvidenceFindUniqueArgs;

export type EvidenceStatusType =
  EvidenceStatus;

export interface EvidenceStatistics {
  total: number;

  created: number;

  generating: number;

  generated: number;

  verified: number;

  archived: number;

  failed: number;
}