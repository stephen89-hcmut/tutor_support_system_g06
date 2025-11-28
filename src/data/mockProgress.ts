import type { ProgressRecord } from '@/domain/entities/progress';

// Generate progress records for students
// Distribution: ~175 good (progress 75-95), ~175 average (progress 50-74), ~175 weak (progress 20-49)

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

// Generate progress records for all students
export const mockProgressRecords: ProgressRecord[] = [];

// Generate 2-5 progress records per student
for (let studentIndex = 1; studentIndex <= 525; studentIndex++) {
  const studentId = `s${studentIndex}`;
  
  // Determine performance level: ~175 good, ~175 average, ~175 weak
  let performanceLevel: 'good' | 'average' | 'weak';
  if (studentIndex <= 175) {
    performanceLevel = 'good';
  } else if (studentIndex <= 350) {
    performanceLevel = 'average';
  } else {
    performanceLevel = 'weak';
  }
  
  // Generate 2-5 sessions per student
  const numSessions = 2 + Math.floor(Math.random() * 4);
  const startDate = new Date('2024-09-01');
  
  for (let sessionNum = 1; sessionNum <= numSessions; sessionNum++) {
    // Random tutor
    const tutorIndex = 1 + Math.floor(Math.random() * 70);
    const tutorId = `t${tutorIndex}`;
    const tutorName = `Tutor ${tutorIndex}`;
    
    // Random subject and topic
    const subjects = Object.keys(topicsBySubject);
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const topics = topicsBySubject[subject];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    // Generate date (spread over 3 months)
    const daysOffset = Math.floor(Math.random() * 90);
    const sessionDate = new Date(startDate);
    sessionDate.setDate(sessionDate.getDate() + daysOffset);
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
}

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
