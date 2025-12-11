export type AttendanceStatus = 'Present' | 'Absent';

export interface ProgressRecord {
  id: string;
  meetingId: string;
  date: string; // ISO Date
  subject: string;
  tutorName: string;
  tutorAvatar?: string | null;
  attendance: AttendanceStatus;
  scores: {
    understanding: number; // 1-10
    practice: number; // 1-10
    engagement: number; // 1-10
  };
  comment: string;
  hasMaterials: boolean;
  isTutorRated: boolean;
}

export interface ProgressStats {
  attendanceRate: number; // Percentage
  avgScore: number; // 1-10
  avgScoreTrend: number; // Diff vs last month
  totalHours: number;
}
