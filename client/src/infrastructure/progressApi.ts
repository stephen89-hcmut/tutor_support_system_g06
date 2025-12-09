import type { ProgressRecord } from '@/domain/entities/progress';
import type { Role } from '@/contexts/RoleContext';
import { mockProgressRepository } from './repositories/progressRepository';
import { simulateNetworkLatency } from './utils/network';

export type ProgressApiRole = Exclude<Role, null>;

export class MockProgressApi {
  /**
   * Get list progress by studentId
   * Student: only own studentId
   * Tutor:   any studentId
   * Manager: any studentId
   */
  async getProgressByStudent(
    requesterRole: ProgressApiRole,
    requesterId: string,
    studentId: string,
  ): Promise<ProgressRecord[]> {
    await simulateNetworkLatency();

    if (requesterRole === 'Student' && requesterId !== studentId) {
      throw new Error('Permission denied: student can only view own progress');
    }

    return mockProgressRepository.listByStudent(studentId);
  }

  /**
   * Create new progress record
   * Student: not allowed
   * Tutor:   allowed
   * Manager: not allowed (theo mô tả chỉ delete + list)
   */
  async createProgress(
    requesterRole: ProgressApiRole,
    payload: ProgressRecord,
  ): Promise<ProgressRecord> {
    await simulateNetworkLatency();

    if (requesterRole !== 'Tutor') {
      throw new Error('Permission denied: only Tutor can create progress records');
    }

    return mockProgressRepository.create(payload);
  }

  /**
   * Edit / update progress record
   * Student: not allowed
   * Tutor:   allowed
   * Manager: not allowed (chỉ delete + list theo yêu cầu)
   */
  async updateProgress(
    requesterRole: ProgressApiRole,
    progressId: string,
    update: Partial<ProgressRecord>,
  ): Promise<ProgressRecord | undefined> {
    await simulateNetworkLatency();

    if (requesterRole !== 'Tutor') {
      throw new Error('Permission denied: only Tutor can edit progress records');
    }

    return mockProgressRepository.update(progressId, update);
  }

  /**
   * Delete progress record
   * Student: not allowed
   * Tutor:   not allowed
   * Manager: allowed
   */
  async deleteProgress(
    requesterRole: ProgressApiRole,
    progressId: string,
  ): Promise<boolean> {
    await simulateNetworkLatency();

    if (requesterRole !== 'Manager') {
      throw new Error('Permission denied: only Manager can delete progress records');
    }

    return mockProgressRepository.delete(progressId);
  }
}

export const mockProgressApi = new MockProgressApi();
