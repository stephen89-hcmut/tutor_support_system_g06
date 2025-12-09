import { Meeting, Feedback, ProgressRecord, User } from '../interfaces';
import { mockStudentAccounts, mockTutorAccounts } from '../data/mockUsers';

// Convert existing meetings to new format and ensure s1 has proper meetings
const generateMeetingsForStudent = (): Meeting[] => {
  const meetings: Meeting[] = [];
  let meetingId = 1;

  // Get tutor accounts for assignment
  const tutors = mockTutorAccounts.slice(0, 5);
  const subjects = [
    'Data Structures - Binary Trees',
    'Algorithms - Sorting',
    'Database Design',
    'Web Development',
    'Machine Learning',
  ];

  // Helper function to create ISO datetime string
  const createISODateTime = (daysOffset: number, hour: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
  };

  // Generate meetings for student s1 (sv.nguyenvana)
  // 3 upcoming (Scheduled)
  for (let i = 0; i < 3; i++) {
    const daysAhead = 5 + i * 10; // 5, 15, 25 days from now
    const hours = [8, 10, 14, 16];
    const hour = hours[i];

    const tutor = tutors[i % tutors.length];

    meetings.push({
      meetingId: `MT-s1-${meetingId++}`,
      title: subjects[i % subjects.length],
      status: 'SCHEDULED',
      timeSlot: {
        startTime: createISODateTime(daysAhead, hour),
        endTime: createISODateTime(daysAhead, hour + 1),
      },
      student: { id: 's1', name: 'Nguyen Van A' },
      tutor: { id: tutor.userId, name: tutor.username.replace('tutor.', '').replace(/\./g, ' ') },
      location: 'Zoom',
      link: `https://zoom.us/j/${Math.random().toString(36).substring(7)}`,
      subject: subjects[i % subjects.length],
    });
  }

  // 16 completed
  for (let i = 0; i < 16; i++) {
    const daysAgo = -(5 + i * 7); // Spread over past days
    const hours = [8, 10, 14, 16];
    const hour = hours[i % 4];

    const tutor = tutors[i % tutors.length];

    meetings.push({
      meetingId: `MT-s1-${meetingId++}`,
      title: subjects[i % subjects.length],
      status: 'COMPLETED',
      timeSlot: {
        startTime: createISODateTime(daysAgo, hour),
        endTime: createISODateTime(daysAgo, hour + 1),
      },
      student: { id: 's1', name: 'Nguyen Van A' },
      tutor: { id: tutor.userId, name: tutor.username.replace('tutor.', '').replace(/\./g, ' ') },
      location: 'Zoom',
      link: `https://zoom.us/j/${Math.random().toString(36).substring(7)}`,
      subject: subjects[i % subjects.length],
      rating: 4.5 + Math.random() * 0.5,
      feedback: 'Great session, very helpful!',
    });
  }

  // 1 cancelled
  const tutor = tutors[0];

  meetings.push({
    meetingId: `MT-s1-${meetingId++}`,
    title: subjects[0],
    status: 'CANCELLED',
    timeSlot: {
      startTime: createISODateTime(-100, 9),
      endTime: createISODateTime(-100, 10),
    },
    student: { id: 's1', name: 'Nguyen Van A' },
    tutor: { id: tutor.userId, name: tutor.username.replace('tutor.', '').replace(/\./g, ' ') },
    location: 'In-Person',
    description: 'Cancelled - Personal emergency',
    subject: subjects[0],
  });

  return meetings;
};

// Initialize users from existing mock data
const initializeUsers = (): User[] => {
  const users: User[] = [];

  mockStudentAccounts.slice(0, 20).forEach((account) => {
    users.push({
      id: account.userId,
      name: account.username.replace('sv.', '').replace(/\./g, ' '),
      email: account.email,
      role: 'Student',
    });
  });

  mockTutorAccounts.slice(0, 10).forEach((account) => {
    users.push({
      id: account.userId,
      name: account.username.replace('tutor.', '').replace(/\./g, ' '),
      email: account.email,
      role: 'Tutor',
    });
  });

  return users;
};

// Giả lập bảng Users
export const users: User[] = initializeUsers();

// Giả lập bảng Meetings - now with proper data for s1
export const meetings: Meeting[] = generateMeetingsForStudent();

// Giả lập bảng Feedbacks
export const feedbacks: Feedback[] = [
  {
    id: 'FB001',
    studentId: 's1',
    tutorId: 't1',
    rating: 5,
    comment: 'Tutor rất giỏi, giải thích rõ ràng và dễ hiểu!',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    reply: 'Cảm ơn em, rất vui được giúp đỡ em!',
    replyDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'FB002',
    studentId: 's1',
    tutorId: 't2',
    rating: 4,
    comment: 'Tốt, nhưng cần giải thích thêm về một số vấn đề phức tạp.',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Giả lập bảng ProgressRecords
export const progressRecords: ProgressRecord[] = [
  {
    id: 'PR001',
    sessionId: 'SESS001',
    studentId: 's1',
    tutorId: 't1',
    score: 8.5,
    summary: 'Học viên hiểu rõ về Binary Trees, cần luyện thêm về implementation.',
    skillsImproved: ['Binary Trees', 'Tree Traversal'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'PR002',
    sessionId: 'SESS002',
    studentId: 's1',
    tutorId: 't2',
    score: 7.0,
    summary: 'Học viên có khó khăn với Sorting Algorithms, cần ôn lại cơ bản.',
    skillsImproved: ['Bubble Sort', 'Quick Sort'],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
