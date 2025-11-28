import type { ProgressRecord, SessionHistory } from '@/domain/entities/progress';
import { mockProgressRecords } from '@/data/mockProgress';
import { simulateNetworkLatency } from '../utils/network';

class MockProgressRepository {
  async list(): Promise<ProgressRecord[]> {
    await simulateNetworkLatency();
    return mockProgressRecords.map((record) => ({ ...record }));
  }

  async listByStudent(studentId: string): Promise<ProgressRecord[]> {
    await simulateNetworkLatency();
    return mockProgressRecords
      .filter((record) => record.studentId === studentId)
      .map((record) => ({ ...record }));
  }

  async getSessionHistory(studentId: string): Promise<SessionHistory[]> {
    await simulateNetworkLatency();
    return mockProgressRecords
      .filter((record) => record.studentId === studentId)
      .map((record) => ({
        sessionId: record.sessionId,
        date: record.sessionDate,
        tutorName: record.tutorName,
        topic: record.topic,
        overallRating: record.overallRating,
        understanding: record.understanding,
        problemSolving: record.problemSolving,
        codeQuality: record.codeQuality,
        participation: record.participation,
        tutorComments: record.tutorComments,
      }));
  }

  async create(record: ProgressRecord): Promise<ProgressRecord> {
    await simulateNetworkLatency();
    mockProgressRecords.push(record);
    return record;
  }
}

export const mockProgressRepository = new MockProgressRepository();

