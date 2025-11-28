export type MeetingMode = 'Online' | 'In-Person' | 'Both';
export type Gender = 'Male' | 'Female' | 'Other';
export type Language = 'English' | 'Vietnamese' | 'Both';

export interface TutorProfile {
  id: string;
  name: string;
  initials: string;
  department: string;
  specialization: string;
  rating: number;
  reviewCount: number;
  sessionCount: number;
  skills: string[];
  meetingMode: MeetingMode;
  gender: Gender;
  languages: Language[];
  bio: string;
  availability: Array<{
    date: string;
    time: string;
  }>;
  matchScore?: number;
}


