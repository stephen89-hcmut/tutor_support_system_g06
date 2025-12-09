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
  'Database Design': [
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
    understanding = 80 + Math.floor(Math.random() * 16); // 80-95
    problemSolving = 75 + Math.floor(Math.random() * 21); // 75-95
    codeQuality = 78 + Math.floor(Math.random() * 18); // 78-95
    participation = 85 + Math.floor(Math.random() * 11); // 85-95
    overallRating = Math.random() > 0.4 ? 'Excellent' : 'Good';
    tutorComments = [
      'Excellent progress on binary tree implementation. Student demonstrated strong understanding of tree traversal algorithms. Homework: Complete AVL tree implementation.',
      'Great work! Student shows good grasp of sorting concepts and applies them well. Successfully optimized bubble sort to achieve O(n log n) complexity.',
      'Outstanding performance on database normalization. Ready for more advanced topics like query optimization and indexing strategies.',
      'Very good understanding of React hooks. Student is making excellent progress with useState and useEffect. Next session: Context API.',
      'Excellent application of design patterns. Student implemented Observer pattern flawlessly. Keep up the great work!',
      'Strong grasp of dynamic programming concepts. Successfully solved knapsack problem with memoization. Ready for advanced DP problems.',
      'Impressive work on neural network basics. Student understood forward and backward propagation well. Next: implement a simple perceptron.',
      'Outstanding problem-solving skills demonstrated. Student independently debugged complex async/await issues in Node.js backend.',
    ][Math.floor(Math.random() * 8)];
  } else if (performanceLevel === 'average') {
    understanding = 55 + Math.floor(Math.random() * 20); // 55-74
    problemSolving = 50 + Math.floor(Math.random() * 25); // 50-74
    codeQuality = 58 + Math.floor(Math.random() * 17); // 58-74
    participation = 65 + Math.floor(Math.random() * 15); // 65-79
    overallRating = Math.random() > 0.5 ? 'Good' : 'Average';
    tutorComments = [
      'Good progress on graph algorithms, but needs more practice with BFS and DFS implementation. Suggested review: practice on LeetCode problems.',
      'Student is making steady progress with SQL queries. More practice with JOIN operations would help. Review material on inner vs outer joins.',
      'Understanding of OOP concepts is developing well. Continue practicing inheritance and polymorphism with real-world examples.',
      'Good effort on REST API design. Review the material on HTTP methods and status codes. Practice building CRUD endpoints.',
      'Making progress on machine learning basics. Focus on understanding the fundamentals of linear regression better before moving to complex models.',
      'Decent understanding of testing concepts. Need to practice writing more comprehensive unit tests with edge cases.',
    ][Math.floor(Math.random() * 6)];
  } else {
    // weak
    understanding = 35 + Math.floor(Math.random() * 20); // 35-54
    problemSolving = 30 + Math.floor(Math.random() * 25); // 30-54
    codeQuality = 40 + Math.floor(Math.random() * 15); // 40-54
    participation = 50 + Math.floor(Math.random() * 20); // 50-69
    overallRating = Math.random() > 0.5 ? 'Average' : 'Needs Improvement';
    tutorComments = [
      'Student is struggling with recursion concepts. Needs more support and practice with base cases. Let\'s schedule extra session for fundamentals.',
      'Requires additional help with pointer arithmetic in C++. Let\'s review the basics again with visual diagrams and step-by-step examples.',
      'Student needs more time to understand hash table collision resolution. Consider extra sessions on open addressing vs chaining.',
      'Struggling with async JavaScript and promises. Recommend additional practice and review. Start with simpler callback examples first.',
      'Needs improvement on database transactions and ACID properties. Let\'s break down the concepts into smaller, digestible parts with examples.',
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

// For now, we'll only generate progress records for student s1 (nguyenvana)
// Future: can be expanded to generate for other students with completed meetings

// Add 16 specific progress records for student s1 (nguyenvana) across 6 subjects
// These match the 16 meetings we created for s1 (m-s1-1 through m-s1-16)
const s1StudentId = 's1';
const s1Tutors = [
  mockTutorAccounts[0],
  mockTutorAccounts[1],
  mockTutorAccounts[2],
  mockTutorAccounts[3],
];

const s1Subjects = ['Data Structures', 'Algorithms', 'Database Design', 'Web Development', 'Machine Learning', 'Software Engineering'];
const s1StartDate = new Date('2024-08-01');

// Generate exactly 16 progress records matching 16 completed meetings
// Performance pattern: realistic progression showing improvement over time
const performancePattern: ('good' | 'average' | 'weak')[] = [
  'good',     // 1. Data Structures - Arrays - Strong start
  'good',     // 2. Algorithms - Sorting - Building on fundamentals
  'average',  // 3. Database - SQL - New topic, needs practice
  'good',     // 4. Web Dev - HTML/CSS - Comfortable with basics
  'average',  // 5. Machine Learning - Linear Regression - Complex new topic
  'weak',     // 6. Software Eng - Design Patterns - Struggling initially
  'average',  // 7. Data Structures - Stacks - Reviewing and improving
  'good',     // 8. Algorithms - Search - Getting better
  'good',     // 9. Database - Normalization - Mastered previous concepts
  'good',     // 10. Web Dev - JavaScript - Strong progress
  'average',  // 11. Machine Learning - Classification - Still challenging
  'good',     // 12. Software Eng - OOP Design - Improved significantly
  'good',     // 13. Data Structures - Binary Trees - Confident now
  'average',  // 14. Algorithms - Dynamic Programming - Complex but improving
  'good',     // 15. Database - Indexing - Solid understanding
  'good',     // 16. Web Dev - React - Excellent finish
];

for (let i = 0; i < 16; i++) {
  const subject = s1Subjects[i % 6];
  const topicsList = topicsBySubject[subject];
  
  // Ensure we have topics for all subjects
  if (!topicsList || topicsList.length === 0) continue;
  
  const topic = topicsList[Math.floor(i / 6) % topicsList.length]; // Better distribution
  const tutor = s1Tutors[i % s1Tutors.length];
  
  const sessionDate = new Date(s1StartDate);
  sessionDate.setDate(sessionDate.getDate() + i * 5); // Match meeting spacing exactly
  
  const dateStr = sessionDate.toISOString().split('T')[0];
  
  const recordId = `pr-${s1StudentId}-${i + 1}`;
  const sessionId = `m-s1-${i + 1}`; // Match meeting ID exactly (m-s1-1, m-s1-2, ..., m-s1-16)
  
  const performanceLevel = performancePattern[i];
  
  mockProgressRecords.push(
    generateProgressRecord(
      recordId,
      s1StudentId,
      sessionId,
      dateStr,
      tutor.userId,
      getTutorName(tutor.username),
      `${subject} - ${topic}`,
      performanceLevel
    )
  );
}

// Log to verify we have 16 records
console.log(`Generated ${mockProgressRecords.length} progress records for student s1`);

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
