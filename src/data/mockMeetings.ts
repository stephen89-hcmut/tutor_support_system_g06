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

// Topics by subject for proper categorization
const topicsBySubject: Record<string, string[]> = {
  'Data Structures': [
    'Arrays and Linked Lists',
    'Stacks and Queues',
    'Binary Trees',
    'Hash Tables',
    'Graphs - BFS and DFS',
  ],
  'Algorithms': [
    'Sorting Algorithms',
    'Search Algorithms',
    'Dynamic Programming',
    'Greedy Algorithms',
    'Graph Algorithms',
  ],
  'Database Design': [
    'SQL Queries',
    'Database Normalization',
    'Indexing',
    'Transactions',
    'NoSQL Databases',
  ],
  'Web Development': [
    'HTML/CSS Basics',
    'JavaScript Fundamentals',
    'React Components',
    'Node.js Backend',
    'RESTful APIs',
  ],
  'Machine Learning': [
    'Linear Regression',
    'Classification',
    'Neural Networks',
    'Deep Learning',
    'Data Preprocessing',
  ],
  'Software Engineering': [
    'Design Patterns',
    'Object-Oriented Design',
    'Software Testing',
    'Version Control',
    'Agile Methodology',
  ],
};

// Topics for meetings (legacy - kept for compatibility)
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

// Add 16 specific completed meetings for student s1 (nguyenvana) across 6 subjects
// This ensures progress data has matching meetings
const s1StudentAccount = mockStudentAccounts.find(acc => acc.userId === 's1');
const selectedTutorsForS1 = [
  mockTutorAccounts[0],
  mockTutorAccounts[1],
  mockTutorAccounts[2],
  mockTutorAccounts[3],
];

const subjectsForS1 = ['Data Structures', 'Algorithms', 'Database Design', 'Web Development', 'Machine Learning', 'Software Engineering'];
const startDate = new Date('2024-08-01');
let meetingIdS1 = 1;

if (s1StudentAccount) {
  // Generate exactly 16 completed meetings for student s1
  for (let i = 0; i < 16; i++) {
    const subject = subjectsForS1[i % 6];
    const topicsList = topicsBySubject[subject];
    
    // Ensure we have topics
    if (!topicsList || topicsList.length === 0) continue;
    
    const topic = topicsList[Math.floor(i / 6) % topicsList.length]; // Better distribution across topics
    const tutor = selectedTutorsForS1[i % selectedTutorsForS1.length];
    
    const meetingDate = new Date(startDate);
    meetingDate.setDate(meetingDate.getDate() + i * 5); // Space meetings 5 days apart
    
    const dateStr = meetingDate.toISOString().split('T')[0];
    const times = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const time = times[i % times.length];
    const mode = ['Zoom', 'Teams', 'In-Person'][i % 3] as 'Zoom' | 'Teams' | 'In-Person';
    
    meetingId++;
    
    mockMeetings.push({
      id: `m-s1-${meetingIdS1}`, // m-s1-1, m-s1-2, ..., m-s1-16
      date: dateStr,
      time,
      studentId: s1StudentAccount.userId,
      studentName: getStudentName(s1StudentAccount.username),
      tutorId: tutor.userId,
      tutorName: getTutorName(tutor.username),
      topic: `${subject} - ${topic}`,
      mode,
      status: 'Completed' as const,
      link: mode !== 'In-Person' ? `https://meet.google.com/${Math.random().toString(36).substring(7)}` : undefined,
      location: mode === 'In-Person' ? 'HCMUT Campus - Room A3.201' : undefined,
      notes: 'Session completed successfully.',
    });
    
    meetingIdS1++;
  }
  
  console.log(`Generated ${meetingIdS1 - 1} completed meetings for student s1`);
}
