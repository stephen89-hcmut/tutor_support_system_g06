export interface Course {
  courseId: string;
  courseCode: string;
  courseName: string;
  department: string;
  credits: number;
  description?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  tutorIds?: string[]; // IDs of tutors who teach this course
}





