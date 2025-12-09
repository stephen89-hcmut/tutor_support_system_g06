import { studentImpl } from '../implementation/student.impl';
import { User, CreateFeedbackPayload, Feedback } from '../interfaces';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const studentApi = {
  /**
   * GET /api/v1/students/{studentId}
   * Get student profile
   */
  getProfile: async (studentId: string): Promise<User> => {
    await delay(300);
    const profile = studentImpl.getProfile(studentId);
    if (!profile) throw new Error('Student profile not found');
    return profile;
  },

  /**
   * GET /api/v1/tutors
   * Get all available tutors (for booking)
   */
  getAllTutors: async () => {
    await delay(400);
    return studentImpl.getAllTutors();
  },

  /**
   * POST /api/v1/feedbacks
   * Submit feedback for a tutor
   */
  submitFeedback: async (payload: CreateFeedbackPayload): Promise<Feedback> => {
    await delay(800);
    return studentImpl.createFeedback(payload);
  },

  /**
   * GET /api/v1/feedbacks
   * Get my feedbacks (for history)
   */
  getMyFeedbacks: async (studentId: string): Promise<Feedback[]> => {
    await delay(500);
    return studentImpl.getMyFeedbacks(studentId);
  },
};
