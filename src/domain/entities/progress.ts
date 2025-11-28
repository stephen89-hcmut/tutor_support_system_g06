export type OverallRating = 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
export type AttendanceStatus = 'Present' | 'Absent';

export interface ProgressRecord {
  recordId: string;
  studentId: string;
  sessionId: string;
  sessionDate: string;
  tutorId: string;
  tutorName: string;
  topic: string;
  attendance: AttendanceStatus;
  absenceReason?: string;
  understanding: number;
  problemSolving: number;
  codeQuality: number;
  participation: number;
  overallRating: OverallRating;
  tutorComments: string;
  privateNote?: string;
  createdAt: string;
  createdBy: string;
}

export interface SessionHistory {
  sessionId: string;
  date: string;
  tutorName: string;
  topic: string;
  overallRating: OverallRating;
  understanding: number;
  problemSolving: number;
  codeQuality: number;
  participation: number;
  tutorComments: string;
}

