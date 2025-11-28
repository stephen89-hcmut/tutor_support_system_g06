export type MeetingStatus = 'Scheduled' | 'Completed' | 'Cancelled';
export type MeetingMode = 'Zoom' | 'Teams' | 'In-Person';
export type CancelledBy = 'Student' | 'Tutor' | 'System';

export interface Meeting {
  id: string;
  date: string; // ISO date string
  time: string; // HH:mm format
  studentId: string;
  studentName: string;
  tutorId: string;
  tutorName: string;
  topic: string;
  mode: MeetingMode;
  location?: string; // For in-person meetings
  link?: string; // For online meetings
  status: MeetingStatus;
  cancelledBy?: CancelledBy;
  cancellationReason?: string;
  notes?: string;
}

export const mockMeetings: Meeting[] = [
  {
    id: 'm1',
    date: '2024-11-28',
    time: '09:00',
    studentId: '1',
    studentName: 'Nguyen Van A',
    tutorId: 't1',
    tutorName: 'Dr. Tran Minh',
    topic: 'Calculus I',
    mode: 'Zoom',
    link: 'https://zoom.us/j/123456789',
    status: 'Scheduled',
  },
  {
    id: 'm2',
    date: '2024-11-29',
    time: '14:00',
    studentId: '2',
    studentName: 'Le Thi B',
    tutorId: 't2',
    tutorName: 'Prof. Pham Hoa',
    topic: 'Physics II',
    mode: 'In-Person',
    location: 'Room A3.201',
    status: 'Scheduled',
  },
  {
    id: 'm3',
    date: '2024-11-30',
    time: '10:30',
    studentId: '3',
    studentName: 'Tran Van C',
    tutorId: 't3',
    tutorName: 'Dr. Nguyen Lan',
    topic: 'Data Structures',
    mode: 'Teams',
    link: 'https://teams.microsoft.com/l/meetup-join/...',
    status: 'Scheduled',
  },
  {
    id: 'm4',
    date: '2024-11-25',
    time: '15:00',
    studentId: '1',
    studentName: 'Nguyen Van A',
    tutorId: 't1',
    tutorName: 'Dr. Tran Minh',
    topic: 'Calculus I',
    mode: 'Zoom',
    link: 'https://zoom.us/j/123456789',
    status: 'Completed',
  },
  {
    id: 'm5',
    date: '2024-11-26',
    time: '11:00',
    studentId: '4',
    studentName: 'Pham Thi D',
    tutorId: 't2',
    tutorName: 'Prof. Pham Hoa',
    topic: 'Database Design',
    mode: 'In-Person',
    location: 'Room A3.201',
    status: 'Completed',
  },
  {
    id: 'm6',
    date: '2024-11-27',
    time: '16:00',
    studentId: '5',
    studentName: 'Hoang Van E',
    tutorId: 't3',
    tutorName: 'Dr. Nguyen Lan',
    topic: 'Object-Oriented Programming',
    mode: 'Teams',
    link: 'https://teams.microsoft.com/l/meetup-join/...',
    status: 'Cancelled',
    cancelledBy: 'Student',
    cancellationReason: 'Personal emergency',
  },
];

