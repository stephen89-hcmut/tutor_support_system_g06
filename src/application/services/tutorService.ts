import type { TutorProfile } from '@/domain/entities/tutor';
import { mockTutorRepository } from '@/infrastructure/mockApi/repositories/tutorRepository';

class TutorService {
  async list(): Promise<TutorProfile[]> {
    return mockTutorRepository.list();
  }

  async getById(tutorId: string): Promise<TutorProfile | undefined> {
    return mockTutorRepository.findById(tutorId);
  }
}

export const tutorService = new TutorService();


