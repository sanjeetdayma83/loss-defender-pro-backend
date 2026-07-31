import {
  Claim,
  ClaimPriority,
  ClaimResolutionType,
  ClaimStatus,
} from '@prisma/client';

import {
  ClaimAIAnalysis,
  ClaimEvidenceSummary,
  ClaimResolution,
  ClaimStatistics,
} from '../types/claim.types';

export interface IClaimService {
  /**
   * Create a new claim.
   */
  create(data: unknown): Promise<Claim>;

  /**
   * Update an existing claim.
   */
  update(id: string, data: unknown): Promise<Claim>;

  /**
   * Delete (soft delete) a claim.
   */
  remove(id: string): Promise<void>;

  /**
   * Find a claim by id.
   */
  findById(id: string): Promise<Claim | null>;

  /**
   * Search claims.
   */
  findAll(filters?: unknown): Promise<Claim[]>;

  /**
   * Change claim status.
   */
  changeStatus(id: string, status: ClaimStatus): Promise<Claim>;

  /**
   * Change claim priority.
   */
  changePriority(id: string, priority: ClaimPriority): Promise<Claim>;

  /**
   * Run AI analysis.
   */
  analyze(id: string): Promise<ClaimAIAnalysis>;

  /**
   * Validate attached evidence.
   */
  validateEvidence(id: string): Promise<ClaimEvidenceSummary>;

  /**
   * Resolve claim.
   */
  resolve(id: string, resolution: ClaimResolution): Promise<Claim>;

  /**
   * Close claim.
   */
  close(id: string): Promise<Claim>;

  /**
   * Re-open claim.
   */
  reopen(id: string): Promise<Claim>;

  /**
   * Cancel claim.
   */
  cancel(id: string): Promise<Claim>;

  /**
   * Escalate claim.
   */
  escalate(id: string): Promise<Claim>;

  /**
   * Assign claim.
   */
  assign(id: string, userId: string): Promise<Claim>;

  /**
   * Generate final resolution.
   */
  generateResolution(id: string): Promise<ClaimResolutionType>;

  /**
   * Get dashboard statistics.
   */
  getStatistics(
    companyId: string,
    warehouseId?: string,
  ): Promise<ClaimStatistics>;
}
