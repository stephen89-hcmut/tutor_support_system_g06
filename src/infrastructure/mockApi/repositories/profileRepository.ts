import type { Role } from '@/domain/entities/user';
import type { UserProfile } from '@/domain/entities/profile';
import { mockUserProfiles, getUserProfile } from '@/data/mockUserProfile';
import { simulateNetworkLatency } from '../utils/network';

class MockProfileRepository {
  async getByRole(role: Role): Promise<UserProfile> {
    await simulateNetworkLatency();
    // Return first profile of that role (for backward compatibility)
    const profiles = Object.values(mockUserProfiles).filter(p => p.role === role);
    if (profiles.length === 0) {
      throw new Error(`Profile not found for role ${role}`);
    }
    return { ...profiles[0] };
  }

  async getByUserId(userId: string): Promise<UserProfile | undefined> {
    await simulateNetworkLatency();
    return getUserProfile(userId);
  }
}

export const mockProfileRepository = new MockProfileRepository();
