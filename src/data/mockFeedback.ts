import type { StudentProfile } from '@/domain/entities/student';
import { mockStudents } from './mockStudents';

export interface StudentFeedback {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  session: string;
  topic: string;
  message: string;
  rating: number;
  status: 'Responded' | 'Pending' | 'New';
  response?: string;
  responseDate?: string;
}

// Flatten feedback from all students
export const mockFeedback: StudentFeedback[] = [];

mockStudents.forEach(student => {
  if (student.feedback && student.feedback.length > 0) {
    student.feedback.forEach((fb) => {
      const sessionInfo = student.sessionHistory && student.sessionHistory.length > 0 
        ? student.sessionHistory[0] 
        : null;
      
      mockFeedback.push({
        id: fb.id,
        studentId: student.id,
        studentName: student.name,
        date: fb.date,
        session: sessionInfo ? `${sessionInfo.topic}` : 'Unknown Session',
        topic: sessionInfo ? sessionInfo.topic : 'Unknown',
        message: fb.message,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        status: (fb.status as any) || 'Pending',
        response: fb.response,
        responseDate: fb.response ? '2024-11-20' : undefined,
      });
    });
  }
});
