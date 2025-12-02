import type { Meeting } from '@/domain/entities/meeting';
import { mockStudentAccounts } from './mockUsers';
import { mockTutorAccounts } from './mockUsers';

// Helper to get student name from username
function getStudentName(username: string): string {
  // Extract name from username like "sv.nguyenvana" -> "Nguyen Van A"
  const name = username.replace('sv.', '');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Helper to get tutor name from username
function getTutorName(username: string): string {
  if (username.startsWith('tutor.')) {
    const name = username.replace('tutor.', '');
    return `Dr. ${name.charAt(0).toUpperCase() + name.slice(1)}`;
  }
  return `Dr. ${username.charAt(0).toUpperCase() + username.slice(1)}`;
}

// Topics for meetings
const topics = [
  'Data Structures - Binary Trees',
  'Algorithms - Sorting',
  'Database Design',
  'Web Development',
  'Machine Learning',
  'Software Engineering',
  'Object-Oriented Programming',
  'System Design',
  'Python Programming',
  'Java Programming',
  'Calculus I',
  'Linear Algebra',
  'Statistics',
  'Computer Networks',
  'Cybersecurity'
];

// Meeting modes
const modes: Array<'Zoom' | 'Teams' | 'In-Person'> = ['Zoom', 'Teams', 'In-Person'];

// Generate meetings with exact distribution:
// Total: 450
// Completed: 300
// Upcoming (Scheduled): 100
// Cancelled: 50
export const mockMeetings: Meeting[] = [];

const meetingCounts = {
  completed: 300,
  scheduled: 100,
  cancelled: 50,
};

let meetingId = 0;
const today = new Date();

// Helper to generate a meeting
function createMeeting(
  status: 'Completed' | 'Scheduled' | 'Cancelled',
): Meeting {
  const studentIndex = Math.floor(Math.random() * mockStudentAccounts.length);
  const tutorIndex = Math.floor(Math.random() * mockTutorAccounts.length);
  const student = mockStudentAccounts[studentIndex];
  const tutor = mockTutorAccounts[tutorIndex];

  let meetingDate: Date;
  if (status === 'Completed') {
    // Past dates (up to 180 days ago)
    const daysAgo = 5 + Math.floor(Math.random() * 180);
    meetingDate = new Date(today);
    meetingDate.setDate(meetingDate.getDate() - daysAgo);
  } else if (status === 'Scheduled') {
    // Future dates (1-60 days ahead)
    const daysAhead = 1 + Math.floor(Math.random() * 60);
    meetingDate = new Date(today);
    meetingDate.setDate(meetingDate.getDate() + daysAhead);
  } else {
    // Cancelled: past dates (5-150 days ago)
    const daysAgo = 5 + Math.floor(Math.random() * 150);
    meetingDate = new Date(today);
    meetingDate.setDate(meetingDate.getDate() - daysAgo);
  }

  const dateStr = meetingDate.toISOString().split('T')[0];
  const times = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const time = times[Math.floor(Math.random() * times.length)];
  const topic = topics[Math.floor(Math.random() * topics.length)];
  const mode = modes[Math.floor(Math.random() * modes.length)];

  meetingId++;

  const meeting: Meeting = {
    id: `m-${meetingId}`,
    date: dateStr,
    time,
    studentId: student.userId,
    studentName: getStudentName(student.username),
    tutorId: tutor.userId,
    tutorName: getTutorName(tutor.username),
    topic,
    mode,
    status,
    link: mode !== 'In-Person' ? `https://meet.google.com/${Math.random().toString(36).substring(7)}` : undefined,
    location: mode === 'In-Person' ? 'HCMUT Campus - Room A3.201' : undefined,
  };

  if (status === 'Completed') {
    meeting.notes = 'Session completed successfully.';
  } else if (status === 'Cancelled') {
    meeting.cancelledBy = Math.random() > 0.5 ? 'Student' : 'Tutor';
    meeting.cancellationReason = Math.random() > 0.5 ? 'Personal emergency' : 'Cannot attend';
  }

  return meeting;
}

// Generate completed meetings
for (let i = 0; i < meetingCounts.completed; i++) {
  mockMeetings.push(createMeeting('Completed'));
}

// Generate scheduled meetings
for (let i = 0; i < meetingCounts.scheduled; i++) {
  mockMeetings.push(createMeeting('Scheduled'));
}

// Generate cancelled meetings
for (let i = 0; i < meetingCounts.cancelled; i++) {
  mockMeetings.push(createMeeting('Cancelled'));
}
