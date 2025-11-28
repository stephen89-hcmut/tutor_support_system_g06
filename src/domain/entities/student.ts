export type StudentStatus = 'Active' | 'At Risk' | 'Inactive';
export type FeedbackStatus = 'Pending' | 'Responded';

export interface StudentSession {
  id: string;
  date: string;
  duration: number;
  topic: string;
  notes: string;
}

export interface StudentProgressPoint {
  date: string;
  score: number;
  category: string;
}

export interface StudentFeedback {
  id: string;
  date: string;
  message: string;
  status: FeedbackStatus;
  response?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  studentId: string;
  progress: number;
  status: StudentStatus;
  rating: number;
  email: string;
  phone: string;
  joinDate: string;
  lastSession: string;
  totalSessions: number;
  personalInfo: {
    dateOfBirth: string;
    address: string;
    major: string;
    year: number;
  };
  sessionHistory: StudentSession[];
  progressData: StudentProgressPoint[];
  feedback: StudentFeedback[];
}


