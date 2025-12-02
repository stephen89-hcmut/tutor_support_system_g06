import { users, feedbacks } from '../mockData/db';
import { User, CreateFeedbackPayload } from '../interfaces';

export const studentImpl = {
  getProfile: (studentId: string): User | undefined => {
    return users.find((u) => u.id === studentId && u.role === 'Student');
  },

  getAllTutors: () => {
    return users.filter((u) => u.role === 'Tutor');
  },

  createFeedback: (data: CreateFeedbackPayload) => {
    const newFeedback = {
      id: `FB${Date.now()}`,
      studentId: data.studentId,
      tutorId: data.tutorId,
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date().toISOString(),
    };
    feedbacks.push(newFeedback);
    return newFeedback;
  },

  getMyFeedbacks: (studentId: string) => {
    return feedbacks.filter((f) => f.studentId === studentId);
  },
};
