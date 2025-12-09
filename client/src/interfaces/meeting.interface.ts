export interface TimeSlot {
  startTime: string; // ISO String
  endTime: string; // ISO String
}

export interface Meeting {
  meetingId: string;
  title: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  timeSlot: TimeSlot;
  student: { id: string; name: string };
  tutor: { id: string; name: string };
  location?: string;
  description?: string;
  link?: string;
  subject?: string;
  rating?: number;
  feedback?: string;
}

export interface CreateMeetingPayload {
  studentId: string;
  tutorId: string;
  timeSlot: TimeSlot;
  subject: string;
  description?: string;
  location?: string;
}

export interface UpdateMeetingPayload {
  timeSlot?: TimeSlot;
  location?: string;
  description?: string;
}
