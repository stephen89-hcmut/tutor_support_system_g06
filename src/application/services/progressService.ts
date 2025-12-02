import type { ProgressRecord } from '@/domain/entities/progress';
import type { ProgressUpdateDto } from '@/domain/dtos';
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

  async getListProgressById(studentId: string): Promise<ProgressRecord[]> {
    return mockProgressRepository.listByStudent(studentId);
  }

  async addRecord(record: ProgressRecord) {
    return mockProgressRepository.create(record);
  }

  async updateProgress(progressId: string, newData: ProgressUpdateDto): Promise<boolean> {
    const record = await mockProgressRepository.update(progressId, newData);
    return Boolean(record);
  }
}

export const progressService = new ProgressService();

