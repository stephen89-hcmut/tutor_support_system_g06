import type { MeetingFeedbackDto } from '@/domain/dtos/meetingFeedback';

interface StoredFeedback extends MeetingFeedbackDto {
  createdAt: string;
  id: string;
}

const feedbackStore: StoredFeedback[] = [];

class MeetingFeedbackService {
  async submitFeedback(feedback: MeetingFeedbackDto): Promise<string> {
    const id = `feedback-${Date.now()}`;
    const storedFeedback: StoredFeedback = {
      ...feedback,
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
