import { httpClient } from '@/lib/httpClient';
import type { CreateFeedbackPayload, Feedback, ProgressRecord } from '../interfaces';

export const tutorApi = {
  getAllTutors: async (search?: string, subject?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (subject) params.append('subject', subject);
    const query = params.toString();
    const path = query ? `/Tutors?${query}` : '/Tutors';
    return httpClient.get<any[]>(path);
  },

  rateTutor: async (payload: { meetingId: string; tutorId: string; rating: number; comment: string }, token?: string | null) => {
    return httpClient.post<{ id: string; averageRating: number; totalReviews: number }, typeof payload>(
      '/Feedbacks',
      payload,
      token,
    );
  },

  // Legacy mocks preserved for other screens (student/tutor dashboards)
  getMyStudents: async () => [],
  getStudentProfile: async () => { throw new Error('Not implemented'); },
  getStudentHistory: async () => [],
  getProgressRecords: async () => [],
  recordProgress: async (_: any): Promise<ProgressRecord> => { throw new Error('Not implemented'); },
  getMyFeedbacks: async (): Promise<Feedback[]> => [],
  replyFeedback: async () => ({ message: 'Not implemented' }),
};
