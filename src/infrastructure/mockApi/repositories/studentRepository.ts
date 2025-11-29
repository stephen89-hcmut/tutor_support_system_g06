import type { StudentProfile } from '@/domain/entities/student';
import { mockStudents } from '@/data/mockStudents';
import { simulateNetworkLatency } from '../utils/network';

class MockStudentRepository {
  async list(): Promise<StudentProfile[]> {
    await simulateNetworkLatency();
    return mockStudents.map((student) => ({ ...student }));
  }

  async findById(studentId: string): Promise<StudentProfile | undefined> {
    await simulateNetworkLatency();
    return mockStudents.find((student) => student.id === studentId);
  }
}

export const mockStudentRepository = new MockStudentRepository();



