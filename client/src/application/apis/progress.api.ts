import { httpClient } from '@/lib/httpClient';

export interface ProgressDto {
  id: string;
  meetingId: string;
  date: string;
  subject: string;
  tutorName: string;
  tutorAvatar?: string | null;
  attendance: 'Present' | 'Absent';
  understanding: number;
  practice: number;
  engagement: number;
  comment: string;
  hasMaterials: boolean;
  isTutorRated: boolean;
}

export const progressApi = {
  getByStudent: async (studentId: string, token?: string | null) =>
    httpClient.get<ProgressDto[]>(`/Progress/student/${studentId}`, token),
};
