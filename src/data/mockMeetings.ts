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

// Generate meetings for each student with proper distribution
export const mockMeetings: Meeting[] = [];

mockStudentAccounts.forEach((student) => {
  // Each student has 20-50 total meetings
  const totalMeetings = 20 + Math.floor(Math.random() * 31); // 20-50
  
  // 15-35 completed meetings
  const completedCount = 15 + Math.floor(Math.random() * 21); // 15-35
  
  // 2-3 upcoming (scheduled) meetings
  const upcomingCount = 2 + Math.floor(Math.random() * 2); // 2-3
  
  // Remaining are cancelled
  const cancelledCount = totalMeetings - completedCount - upcomingCount;
  
  // Select 3-5 unique tutors for this student
  const numTutors = 3 + Math.floor(Math.random() * 3); // 3-5
  const selectedTutors: typeof mockTutorAccounts = [];
  const tutorIndices = new Set<number>();
  
  while (selectedTutors.length < numTutors && tutorIndices.size < mockTutorAccounts.length) {
    const index = Math.floor(Math.random() * mockTutorAccounts.length);
    if (!tutorIndices.has(index)) {
      tutorIndices.add(index);
      selectedTutors.push(mockTutorAccounts[index]);
    }
  }
  
  const startDate = new Date('2024-09-01');
  const today = new Date();
  
  // Generate completed meetings (past dates)
  for (let i = 0; i < completedCount; i++) {
    const tutor = selectedTutors[Math.floor(Math.random() * selectedTutors.length)];
    const daysOffset = Math.floor(Math.random() * 90); // Past 90 days
    const meetingDate = new Date(startDate);
    meetingDate.setDate(meetingDate.getDate() + daysOffset);
    
    // Ensure it's in the past
    if (meetingDate > today) {
      meetingDate.setDate(meetingDate.getDate() - 30);
    }
    
    const dateStr = meetingDate.toISOString().split('T')[0];
    const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const time = times[Math.floor(Math.random() * times.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const mode = modes[Math.floor(Math.random() * modes.length)];
    
    mockMeetings.push({
      id: `m-${student.userId}-completed-${i + 1}`,
      date: dateStr,
      time,
      studentId: student.userId,
      studentName: getStudentName(student.username),
      tutorId: tutor.userId,
      tutorName: getTutorName(tutor.username),
      topic,
      mode,
      status: 'Completed',
      link: mode !== 'In-Person' ? `https://meet.google.com/${Math.random().toString(36).substring(7)}` : undefined,
      location: mode === 'In-Person' ? 'HCMUT Campus - Room A3.201' : undefined,
      notes: 'Session completed successfully.',
    });
  }
  
  // Generate upcoming meetings (future dates)
  for (let i = 0; i < upcomingCount; i++) {
    const tutor = selectedTutors[Math.floor(Math.random() * selectedTutors.length)];
    const daysOffset = 1 + Math.floor(Math.random() * 30); // Next 30 days
    const meetingDate = new Date(today);
    meetingDate.setDate(meetingDate.getDate() + daysOffset);
    const dateStr = meetingDate.toISOString().split('T')[0];
    
    const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const time = times[Math.floor(Math.random() * times.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const mode = modes[Math.floor(Math.random() * modes.length)];
    
    mockMeetings.push({
      id: `m-${student.userId}-upcoming-${i + 1}`,
      date: dateStr,
      time,
      studentId: student.userId,
      studentName: getStudentName(student.username),
      tutorId: tutor.userId,
      tutorName: getTutorName(tutor.username),
      topic,
      mode,
      status: 'Scheduled',
      link: mode !== 'In-Person' ? `https://meet.google.com/${Math.random().toString(36).substring(7)}` : undefined,
      location: mode === 'In-Person' ? 'HCMUT Campus - Room A3.201' : undefined,
    });
  }
  
  // Generate cancelled meetings
  for (let i = 0; i < cancelledCount; i++) {
    const tutor = selectedTutors[Math.floor(Math.random() * selectedTutors.length)];
    const daysOffset = Math.floor(Math.random() * 90);
    const meetingDate = new Date(startDate);
    meetingDate.setDate(meetingDate.getDate() + daysOffset);
    
    // Ensure it's in the past
    if (meetingDate > today) {
      meetingDate.setDate(meetingDate.getDate() - 30);
    }
    
    const dateStr = meetingDate.toISOString().split('T')[0];
    const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const time = times[Math.floor(Math.random() * times.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const mode = modes[Math.floor(Math.random() * modes.length)];
    
    mockMeetings.push({
      id: `m-${student.userId}-cancelled-${i + 1}`,
      date: dateStr,
      time,
      studentId: student.userId,
      studentName: getStudentName(student.username),
      tutorId: tutor.userId,
      tutorName: getTutorName(tutor.username),
      topic,
      mode,
      status: 'Cancelled',
      cancelledBy: Math.random() > 0.5 ? 'Student' : 'Tutor',
      cancellationReason: 'Personal emergency',
    });
  }
});
