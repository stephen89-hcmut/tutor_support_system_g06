import type { StudentProfile } from '@/domain/entities/student';
import { mockStudentRepository } from '@/infrastructure/mockApi/repositories/studentRepository';

class StudentService {
  async list(): Promise<StudentProfile[]> {
    return mockStudentRepository.list();
  }

  async getById(studentId: string): Promise<StudentProfile | undefined> {
    return mockStudentRepository.findById(studentId);
  }
}

export const studentService = new StudentService();


