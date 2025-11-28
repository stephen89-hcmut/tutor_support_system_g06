import type { Role } from '@/domain/entities/user';
import type { UserProfile } from '@/domain/entities/profile';
import { mockUserProfiles } from '@/data/mockUserProfile';
import { simulateNetworkLatency } from '../utils/network';

class MockProfileRepository {
  async getByRole(role: Role): Promise<UserProfile> {
    await simulateNetworkLatency();
    const profile = mockUserProfiles[role.toLowerCase() as 'student' | 'tutor' | 'manager'];
    if (!profile) {
      throw new Error(`Profile not found for role ${role}`);
    }
    return { ...profile };
  }
}

export const mockProfileRepository = new MockProfileRepository();

