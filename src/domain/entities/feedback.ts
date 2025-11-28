import { FeedbackVisibility } from '../enums';

export interface Feedback {
  feedbackId: string;
  sessionId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  visibility: FeedbackVisibility;
  createdAt: string;
  replyContent?: string;
  repliedAt?: string;
}


