export interface MeetingDto {
  id: string;
  subject: string;
  title?: string;
  startTime: string;
  endTime: string;
  mode: 'Online' | 'InPerson';
  link?: string;
  location?: string;
  minCapacity: number;
  maxCapacity: number;
  currentCount: number;
  status: string;
  tutorId: string;
  tutorName: string;
  studentId?: string;
  studentName?: string;
}
