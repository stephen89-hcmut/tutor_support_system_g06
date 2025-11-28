export type OverallRating = 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
export type AttendanceStatus = 'Present' | 'Absent';

export interface ProgressRecord {
  recordId: string;
  studentId: string;
  sessionId: string;
  sessionDate: string;
  tutorId: string;
  tutorName: string;
  topic: string;
  attendance: AttendanceStatus;
  absenceReason?: string;
  understanding: number; // 0-100
  problemSolving: number; // 0-100
  codeQuality: number; // 0-100
  participation: number; // 0-100
  overallRating: OverallRating;
  tutorComments: string;
  privateNote?: string;
  createdAt: string;
  createdBy: string;
}

export interface SessionHistory {
  sessionId: string;
  date: string;
  tutorName: string;
  topic: string;
  overallRating: OverallRating;
  understanding: number;
  problemSolving: number;
  codeQuality: number;
  participation: number;
  tutorComments: string;
}

export const mockProgressRecords: ProgressRecord[] = [
  {
    recordId: 'pr1',
    studentId: '1',
    sessionId: 's1',
    sessionDate: '2024-10-28',
    tutorId: 't1',
    tutorName: 'Dr. Nguyen Van A',
    topic: 'Data Structures - Binary Trees',
    attendance: 'Present',
    understanding: 85,
    problemSolving: 80,
    codeQuality: 75,
    participation: 90,
    overallRating: 'Good',
    tutorComments: 'Excellent progress on binary tree implementation. Student demonstrated strong understanding of tree traversal algorithms. Homework: Complete AVL tree implementation.',
    createdAt: '2024-10-28T10:00:00',
    createdBy: 't1',
  },
  {
    recordId: 'pr2',
    studentId: '1',
    sessionId: 's2',
    sessionDate: '2024-10-30',
    tutorId: 't1',
    tutorName: 'Dr. Nguyen Van A',
    topic: 'Algorithms - Graph Traversal',
    attendance: 'Present',
    understanding: 75,
    problemSolving: 70,
    codeQuality: 80,
    participation: 85,
    overallRating: 'Good',
    tutorComments: 'Good grasp of BFS and DFS concepts. Needs more practice with complex graph problems. Suggested to review Dijkstra\'s algorithm before next session.',
    createdAt: '2024-10-30T14:00:00',
    createdBy: 't1',
  },
  {
    recordId: 'pr3',
    studentId: '1',
    sessionId: 's3',
    sessionDate: '2024-11-01',
    tutorId: 't1',
    tutorName: 'Dr. Nguyen Van A',
    topic: 'Software Engineering - Design Patterns',
    attendance: 'Present',
    understanding: 90,
    problemSolving: 85,
    codeQuality: 88,
    participation: 92,
    overallRating: 'Excellent',
    tutorComments: 'Outstanding performance in understanding design patterns. Student showed excellent application of Singleton, Factory, and Observer patterns. Ready for advanced topics.',
    createdAt: '2024-11-01T09:00:00',
    createdBy: 't1',
  },
];

export const mockSessionHistory: SessionHistory[] = mockProgressRecords.map(record => ({
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

// Calculate overall performance
export function calculateOverallPerformance(records: ProgressRecord[]): number {
  if (records.length === 0) return 0;
  const avg = records.reduce((sum, r) => {
    return sum + (r.understanding + r.problemSolving + r.codeQuality + r.participation) / 4;
  }, 0);
  return Math.round(avg / records.length);
}

// Calculate average for each metric
export function calculateAverageMetrics(records: ProgressRecord[]) {
  if (records.length === 0) {
    return {
      understanding: 0,
      problemSolving: 0,
      codeQuality: 0,
      participation: 0,
    };
  }

  return {
    understanding: Math.round(
      records.reduce((sum, r) => sum + r.understanding, 0) / records.length
    ),
    problemSolving: Math.round(
      records.reduce((sum, r) => sum + r.problemSolving, 0) / records.length
    ),
    codeQuality: Math.round(
      records.reduce((sum, r) => sum + r.codeQuality, 0) / records.length
    ),
    participation: Math.round(
      records.reduce((sum, r) => sum + r.participation, 0) / records.length
    ),
  };
}

// Get progress trend data
export function getProgressTrend(records: ProgressRecord[]) {
  return records.map((record, index) => ({
    session: `Session ${index + 1}`,
    average: Math.round(
      (record.understanding + record.problemSolving + record.codeQuality + record.participation) / 4
    ),
    problemSolving: record.problemSolving,
    understanding: record.understanding,
    codeQuality: record.codeQuality,
  }));
}

