import { progressApi, type ProgressDto } from '@/application/apis/progress.api';
import { authService } from './authService';
import type { ProgressRecord as NewProgressRecord } from '@/types/progress';
import type { ProgressRecord as LegacyProgressRecord } from '@/domain/entities/progress';
import { calculateAverageMetrics, calculateOverallPerformance, getProgressTrend } from '@/domain/services/progressMetrics';

const mapToNew = (dto: ProgressDto): NewProgressRecord => ({
  id: dto.id,
  meetingId: dto.meetingId,
  date: dto.date,
  subject: dto.subject,
  tutorName: dto.tutorName,
  tutorAvatar: dto.tutorAvatar,
  attendance: dto.attendance,
  scores: {
    understanding: dto.understanding,
    practice: dto.practice,
    engagement: dto.engagement,
  },
  comment: dto.comment,
  hasMaterials: dto.hasMaterials,
  isTutorRated: dto.isTutorRated,
});

const mapToLegacy = (dto: ProgressDto, studentId: string): LegacyProgressRecord => ({
  recordId: dto.id,
  studentId,
  sessionId: dto.meetingId,
  sessionDate: dto.date,
  tutorId: dto.meetingId,
  tutorName: dto.tutorName,
  topic: dto.subject,
  attendance: dto.attendance,
  understanding: dto.understanding * 10,
  problemSolving: dto.practice * 10,
  codeQuality: dto.practice * 10,
  participation: dto.engagement * 10,
  overallRating: 'Good',
  tutorComments: dto.comment,
  createdAt: dto.date,
  createdBy: 'system',
});

class ProgressService {
  private async fetch(studentId: string) {
    const session = authService.getSession();
    const token = session?.accessToken;
    return progressApi.getByStudent(studentId, token);
  }

  // New page usage
  async getForStudent(studentId: string): Promise<NewProgressRecord[]> {
    const data = await this.fetch(studentId);
    return data.map(mapToNew);
  }

  // Legacy callers expecting aggregates
  async getByStudent(studentId: string) {
    const data = await this.fetch(studentId);
    const legacyRecords = data.map((dto) => mapToLegacy(dto, studentId));
    return {
      records: legacyRecords,
      overall: calculateOverallPerformance(legacyRecords),
      averages: calculateAverageMetrics(legacyRecords),
      trend: getProgressTrend(legacyRecords),
    };
  }

  async getListProgressById(studentId: string): Promise<LegacyProgressRecord[]> {
    const data = await this.fetch(studentId);
    return data.map((dto) => mapToLegacy(dto, studentId));
  }

  async getAll(): Promise<LegacyProgressRecord[]> {
    // Backend does not expose a list-all endpoint; return empty to keep callers safe.
    return [];
  }
}

export const progressService = new ProgressService();

