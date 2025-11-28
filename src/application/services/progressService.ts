import type { ProgressRecord } from '@/domain/entities/progress';
import { calculateAverageMetrics, calculateOverallPerformance, getProgressTrend } from '@/domain/services/progressMetrics';
import { mockProgressRepository } from '@/infrastructure/mockApi/repositories/progressRepository';

class ProgressService {
  async getAll(): Promise<ProgressRecord[]> {
    return mockProgressRepository.list();
  }

  async getByStudent(studentId: string) {
    const records = await mockProgressRepository.listByStudent(studentId);
    return {
      records,
      overall: calculateOverallPerformance(records),
      averages: calculateAverageMetrics(records),
      trend: getProgressTrend(records),
    };
  }

  async addRecord(record: ProgressRecord) {
    return mockProgressRepository.create(record);
  }
}

export const progressService = new ProgressService();

