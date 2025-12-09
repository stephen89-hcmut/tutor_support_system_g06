import type { StudentProfile } from '@/domain/entities/student';
import { mockStudentRepository } from '@/infrastructure/repositories/studentRepository';

class StudentService {
  async list(): Promise<StudentProfile[]> {
    return mockStudentRepository.list();
  }

  async getById(studentId: string): Promise<StudentProfile | undefined> {
    return mockStudentRepository.findById(studentId);
  }

  /**
   * Map từ userId của tài khoản (vd: s1, s2, ...) sang StudentProfile demo.
   * Hiện mockStudents có id '1','2',... tương ứng với các student nổi bật.
   */
  async getByAccountUserId(userId: string): Promise<StudentProfile | null> {
    const numeric = parseInt(userId.replace(/^\D+/, ''), 10);
    if (Number.isNaN(numeric)) return null;
    const index = numeric - 1;
    const students = await mockStudentRepository.list();
    if (index < 0 || index >= students.length) return null;
    return students[index];
  }
}

export const studentService = new StudentService();



