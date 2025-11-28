import { SessionMode, SessionStatus } from '../enums';

export interface SupportSession {
  sessionId: string;
  studentId: string;
  tutorId: string;
  meetingId?: string;
  topic: string;
  mode: SessionMode;
  status: SessionStatus;
  date: string;
  location?: string;
  notes?: string;
}


