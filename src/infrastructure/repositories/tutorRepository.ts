import type { TutorProfile } from '@/domain/entities/tutor';
import { mockTutors } from '@/data/mockTutors';
import { simulateNetworkLatency } from '../utils/network';

class MockTutorRepository {
  async list(): Promise<TutorProfile[]> {
    await simulateNetworkLatency();
    return mockTutors.map((tutor) => ({ ...tutor }));
  }

  async findById(tutorId: string): Promise<TutorProfile | undefined> {
    await simulateNetworkLatency();
    return mockTutors.find((tutor) => tutor.id === tutorId);
  }
}

export const mockTutorRepository = new MockTutorRepository();
