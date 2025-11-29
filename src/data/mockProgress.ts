import type { ProgressRecord } from '@/domain/entities/progress';
import { mockStudentAccounts } from './mockUsers';
import { mockTutorAccounts } from './mockUsers';

// Helper to get tutor name
function getTutorName(username: string): string {
  if (username.startsWith('tutor.')) {
    const name = username.replace('tutor.', '');
    return `Dr. ${name.charAt(0).toUpperCase() + name.slice(1)}`;
  }
  return `Dr. ${username.charAt(0).toUpperCase() + username.slice(1)}`;
}

// Topics by subject area
const topicsBySubject: Record<string, string[]> = {
  'Data Structures': [
    'Arrays and Linked Lists',
    'Stacks and Queues',
    'Binary Trees',
    'Hash Tables',
    'Graphs - BFS and DFS',
    'Heaps and Priority Queues'
  ],
  'Algorithms': [
    'Sorting Algorithms',
    'Search Algorithms',
    'Dynamic Programming',
    'Greedy Algorithms',
    'Graph Algorithms',
    'Recursion and Backtracking'
  ],
  'Database Systems': [
    'SQL Queries',
    'Database Design',
    'Normalization',
    'Indexing',
    'Transactions',
    'NoSQL Databases'
  ],
  'Web Development': [
    'HTML/CSS Basics',
    'JavaScript Fundamentals',
    'React Components',
    'Node.js Backend',
    'RESTful APIs',
    'State Management'
  ],
  'Software Engineering': [
    'Design Patterns',
    'Object-Oriented Design',
    'Software Testing',
    'Version Control',
    'Agile Methodology',
    'Code Review'
  ],
  'Machine Learning': [
    'Linear Regression',
    'Classification',
    'Neural Networks',
    'Deep Learning',
    'Data Preprocessing',
    'Model Evaluation'
  ],
  'Mathematics': [
    'Calculus',
    'Linear Algebra',
    'Discrete Mathematics',
    'Probability',
    'Statistics',
    'Differential Equations'
  ],
  'Python Programming': [
    'Python Basics',
    'Data Structures in Python',
    'Object-Oriented Python',
    'File Handling',
    'Libraries and Modules',
    'Error Handling'
  ],
  'Java Programming': [
    'Java Basics',
    'Classes and Objects',
    'Inheritance and Polymorphism',
    'Collections Framework',
    'Exception Handling',
    'Multithreading'
  ]
};

function generateProgressRecord(
  recordId: string,
  studentId: string,
  sessionId: string,
  sessionDate: string,
  tutorId: string,
  tutorName: string,
  topic: string,
  performanceLevel: 'good' | 'average' | 'weak'
): ProgressRecord {
  let understanding: number;
  let problemSolving: number;
  let codeQuality: number;
  let participation: number;
  let overallRating: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
  let tutorComments: string;

  if (performanceLevel === 'good') {
    understanding = 75 + Math.floor(Math.random() * 20); // 75-95
    problemSolving = 75 + Math.floor(Math.random() * 20);
    codeQuality = 75 + Math.floor(Math.random() * 20);
    participation = 80 + Math.floor(Math.random() * 15);
    overallRating = Math.random() > 0.3 ? 'Excellent' : 'Good';
    tutorComments = [
      'Excellent progress on this topic. Student demonstrated strong understanding.',
      'Great work! Student shows good grasp of concepts and applies them well.',
      'Outstanding performance. Ready for more advanced topics.',
      'Very good understanding. Student is making excellent progress.',
      'Excellent application of concepts. Keep up the great work!'
    ][Math.floor(Math.random() * 5)];
  } else if (performanceLevel === 'average') {
    understanding = 50 + Math.floor(Math.random() * 24); // 50-74
    problemSolving = 50 + Math.floor(Math.random() * 24);
    codeQuality = 50 + Math.floor(Math.random() * 24);
    participation = 60 + Math.floor(Math.random() * 20);
    overallRating = Math.random() > 0.5 ? 'Good' : 'Average';
    tutorComments = [
      'Good progress, but needs more practice to fully understand the concepts.',
      'Student is making steady progress. More practice would help.',
      'Understanding is developing well. Continue practicing.',
      'Good effort. Review the material and practice more.',
      'Making progress. Focus on understanding the fundamentals better.'
    ][Math.floor(Math.random() * 5)];
  } else {
    // weak
    understanding = 20 + Math.floor(Math.random() * 29); // 20-49
    problemSolving = 20 + Math.floor(Math.random() * 29);
    codeQuality = 20 + Math.floor(Math.random() * 29);
    participation = 40 + Math.floor(Math.random() * 20);
    overallRating = Math.random() > 0.5 ? 'Average' : 'Needs Improvement';
    tutorComments = [
      'Student is struggling with this topic. Needs more support and practice.',
      'Requires additional help. Let\'s review the basics again.',
      'Student needs more time to understand these concepts. Consider extra sessions.',
      'Struggling with the material. Recommend additional practice and review.',
      'Needs improvement. Let\'s break down the concepts into smaller parts.'
    ][Math.floor(Math.random() * 5)];
  }

  return {
    recordId,
    studentId,
    sessionId,
    sessionDate,
    tutorId,
    tutorName,
    topic,
    attendance: 'Present',
    understanding,
    problemSolving,
    codeQuality,
    participation,
    overallRating,
    tutorComments,
    createdAt: sessionDate + 'T10:00:00',
    createdBy: tutorId,
  };
}

// Generate progress records for all students
export const mockProgressRecords: ProgressRecord[] = [];

// Generate progress records for each student (matching their meeting count)
mockStudentAccounts.forEach((student, studentIndex) => {
  const studentId = student.userId;
  
  // Determine performance level: ~175 good, ~175 average, ~175 weak
  let performanceLevel: 'good' | 'average' | 'weak';
  if (studentIndex < 175) {
    performanceLevel = 'good';
  } else if (studentIndex < 350) {
    performanceLevel = 'average';
  } else {
    performanceLevel = 'weak';
  }
  
  // Each student has 15-35 completed meetings, so generate progress for those
  // Progress records should match completed meetings (not all meetings have progress)
  const numProgressRecords = 15 + Math.floor(Math.random() * 21); // 15-35
  
  // Select 3-5 unique tutors for this student (same as meetings)
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
  
  for (let sessionNum = 1; sessionNum <= numProgressRecords; sessionNum++) {
    // Random tutor from selected tutors
    const tutor = selectedTutors[Math.floor(Math.random() * selectedTutors.length)];
    const tutorId = tutor.userId;
    const tutorName = getTutorName(tutor.username);
    
    // Random subject and topic
    const subjects = Object.keys(topicsBySubject);
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const topics = topicsBySubject[subject];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    // Generate date (spread over past 90 days, all in the past)
    const daysOffset = Math.floor(Math.random() * 90);
    const sessionDate = new Date(startDate);
    sessionDate.setDate(sessionDate.getDate() + daysOffset);
    
    // Ensure it's in the past
    if (sessionDate > today) {
      sessionDate.setDate(sessionDate.getDate() - 30);
    }
    
    const dateStr = sessionDate.toISOString().split('T')[0];
    
    const recordId = `pr-${studentId}-${sessionNum}`;
    const sessionId = `sess-${studentId}-${sessionNum}`;
    
    mockProgressRecords.push(
      generateProgressRecord(
        recordId,
        studentId,
        sessionId,
        dateStr,
        tutorId,
        tutorName,
        `${subject} - ${topic}`,
        performanceLevel
      )
    );
  }
});

export const mockSessionHistory = mockProgressRecords.map((record) => ({
  sessionId: record.sessionId,
  date: record.sessionDate,
  tutorName: record.tutorName,
  topic: record.topic,
  overallRating: record.overallRating,
  understanding: record.understanding,
  problemSolving: record.problemSolving,
  codeQuality: record.codeQuality,
  participation: record.participation,
  tutorComments: record.tutorComments,
}));
