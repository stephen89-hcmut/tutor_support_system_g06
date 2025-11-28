import type { Feedback } from '@/domain/entities/feedback';
import { FeedbackVisibility } from '@/domain/enums';
import { mockFeedbackRepository } from '@/infrastructure/mockApi/repositories/feedbackRepository';
import { notificationManager } from '@/services/NotificationSystem';

interface CreateFeedbackParams {
  sessionId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  visibility?: FeedbackVisibility;
}

class FeedbackService {
  async createFeedback(params: CreateFeedbackParams): Promise<string> {
    const feedback: Feedback = {
      feedbackId: `fb-${Date.now()}`,
      sessionId: params.sessionId,
      fromUserId: params.fromUserId,
      toUserId: params.toUserId,
      rating: params.rating,
      comment: params.comment,
      isAnonymous: params.isAnonymous,
      visibility: params.visibility ?? FeedbackVisibility.PUBLIC,
      createdAt: new Date().toISOString(),
    };
    await mockFeedbackRepository.create(feedback);
    await notificationManager.sendNotification(
      'email',
      params.toUserId,
      'Bạn có phản hồi mới trong Tutor Support System.',
      'New Feedback',
    );
    return feedback.feedbackId;
  }

  async respondToFeedback(feedbackId: string, replyContent: string): Promise<boolean> {
    const updated = await mockFeedbackRepository.update(feedbackId, {
      replyContent,
      repliedAt: new Date().toISOString(),
    });
    if (!updated) return false;
    await notificationManager.sendNotification(
      'email',
      updated.fromUserId,
      'Tutor đã phản hồi góp ý của bạn.',
      'Feedback Replied',
    );
    return true;
  }
}

export const feedbackService = new FeedbackService();


