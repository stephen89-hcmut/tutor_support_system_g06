import type { MeetingFeedbackDto } from '@/domain/dtos/meetingFeedback';
import { tutorApi } from '@/apis/tutor.api';
import { authService } from './authService';

interface StoredFeedback extends MeetingFeedbackDto {
  createdAt: string;
  id: string;
}

const feedbackStore: StoredFeedback[] = [];

class MeetingFeedbackService {
  async submitFeedback(feedback: MeetingFeedbackDto): Promise<string> {
    if (feedback.rating < 1 || feedback.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const session = authService.getSession();
    if (!session?.accessToken) {
      throw new Error('Bạn cần đăng nhập để gửi đánh giá');
    }

    const response = await tutorApi.rateTutor(
      {
        meetingId: feedback.meetingId,
        tutorId: feedback.tutorId,
        rating: feedback.rating,
        comment: feedback.comment,
      },
      session.accessToken,
    );

    const id = (response as any)?.id || `feedback-${Date.now()}`;
    const storedFeedback: StoredFeedback = {
      ...feedback,
      studentId: feedback.studentId || session.userId,
      id,
      createdAt: new Date().toISOString(),
    };
    feedbackStore.push(storedFeedback);
    return id;
  }

  async getFeedbackByMeeting(meetingId: string): Promise<StoredFeedback | undefined> {
    return feedbackStore.find((f) => f.meetingId === meetingId);
  }

  async getFeedbackByStudent(studentId: string): Promise<StoredFeedback[]> {
    return feedbackStore.filter((f) => f.studentId === studentId);
  }

  async getFeedbackByTutor(tutorId: string): Promise<StoredFeedback[]> {
    return feedbackStore.filter((f) => f.tutorId === tutorId);
  }

  async getAverageRatingForTutor(tutorId: string): Promise<number> {
    const feedbackList = this.getFeedbackByTutor(tutorId);
    if ((await feedbackList).length === 0) return 0;
    const sum = (await feedbackList).reduce((acc, f) => acc + f.rating, 0);
    return sum / (await feedbackList).length;
  }
}

export const meetingFeedbackService = new MeetingFeedbackService();
