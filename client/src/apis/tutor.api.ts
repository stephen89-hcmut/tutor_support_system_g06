import { tutorImpl } from '../implementation/tutor.impl';
import { ProgressRecord, Feedback, CreateProgressPayload } from '../interfaces';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const tutorApi = {
  /**
   * GET /api/v1/tutors/{tutorId}/students
   * Get list of students for a tutor
   */
  getMyStudents: async (
    tutorId: string,
    options?: { page?: number; limit?: number; search?: string }
  ) => {
    await delay(500);
    return tutorImpl.getStudentsByTutor(tutorId, options);
  },

  /**
   * GET /api/v1/students/{studentId}/profile
   * Get student profile details
   */
  getStudentProfile: async (studentId: string) => {
    await delay(300);
    const profile = tutorImpl.getStudentProfile(studentId);
    if (!profile) throw new Error('Student profile not found');
    return profile;
  },

  /**
   * GET /api/v1/students/{studentId}/history
   * Get student learning history
   */
  getStudentHistory: async (studentId: string, tutorId?: string) => {
    await delay(400);
    return tutorImpl.getStudentHistory(studentId, tutorId);
  },

  /**
   * GET /api/v1/progress-records
   * Get progress records for a student
   */
  getProgressRecords: async (studentId: string, sessionId?: string) => {
    await delay(400);
    return tutorImpl.getProgressRecords(studentId, sessionId);
  },

  /**
   * POST /api/v1/progress-records
   * Record student progress after a session
   */
  recordProgress: async (payload: CreateProgressPayload): Promise<ProgressRecord> => {
    await delay(800);
    return tutorImpl.createProgressRecord(payload);
  },

  /**
   * GET /api/v1/feedbacks
   * Get feedbacks for this tutor
   */
  getMyFeedbacks: async (tutorId: string): Promise<Feedback[]> => {
    await delay(500);
    return tutorImpl.getTutorFeedbacks(tutorId);
  },

  /**
   * POST /api/v1/feedbacks/{id}/reply
   * Reply to a feedback
   */
  replyFeedback: async (feedbackId: string, replyContent: string): Promise<{ message: string }> => {
    await delay(600);
    const result = tutorImpl.replyFeedback(feedbackId, replyContent);
    if (!result) throw new Error('Failed to reply feedback');
    return { message: 'Feedback reply successful' };
  },
};
