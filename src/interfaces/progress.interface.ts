export interface ProgressRecord {
  id: string;
  sessionId: string;
  studentId: string;
  tutorId: string;
  score: number;
  summary: string;
  skillsImproved: string[];
  createdAt: string;
}

export interface CreateProgressPayload {
  sessionId: string;
  studentId: string;
  tutorId: string;
  score: number;
  summary: string;
  skillsImproved: string[];
}

export interface Feedback {
  id: string;
  studentId: string;
  tutorId: string;
  rating: number;
  comment: string;
  createdAt: string;
  reply?: string;
  replyDate?: string;
}

export interface CreateFeedbackPayload {
  studentId: string;
  tutorId: string;
  rating: number;
  comment: string;
}

export interface ReplyFeedbackPayload {
  replyContent: string;
}
