import type { Role } from '@/domain/entities/user';
import type { UserProfile } from '@/domain/entities/profile';
import { mockProfileRepository } from '@/infrastructure/mockApi/repositories/profileRepository';

class ProfileService {
  async getProfileByRole(role: Role): Promise<UserProfile> {
    return mockProfileRepository.getByRole(role);
  }

  async getProfileByUserId(userId: string): Promise<UserProfile | undefined> {
    return mockProfileRepository.getByUserId(userId);
  }
}

export const profileService = new ProfileService();


