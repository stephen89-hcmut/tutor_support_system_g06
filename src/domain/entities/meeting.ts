export type MeetingStatus = 'Scheduled' | 'Completed' | 'Cancelled';
export type MeetingMode = 'Zoom' | 'Teams' | 'In-Person';
export type CancelledBy = 'Student' | 'Tutor' | 'System';

export interface Meeting {
  id: string;
  date: string;
  time: string;
  studentId: string;
  studentName: string;
  tutorId: string;
  tutorName: string;
  topic: string;
  mode: MeetingMode;
  location?: string;
  link?: string;
  status: MeetingStatus;
  cancelledBy?: CancelledBy;
  cancellationReason?: string;
  notes?: string;
}

