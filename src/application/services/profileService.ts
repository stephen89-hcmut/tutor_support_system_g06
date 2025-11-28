import type { Role } from '@/domain/entities/user';
import type { UserProfile } from '@/domain/entities/profile';
import { mockProfileRepository } from '@/infrastructure/mockApi/repositories/profileRepository';

class ProfileService {
  async getProfileByRole(role: Role): Promise<UserProfile> {
    return mockProfileRepository.getByRole(role);
  }
}

export const profileService = new ProfileService();

