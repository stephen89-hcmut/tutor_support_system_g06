import type { UserEntity } from '@/domain/entities/user';
import { mockUserRepository } from '@/infrastructure/mockApi/repositories/userRepository';

class AuthService {
  async login(username: string, password: string): Promise<UserEntity | null> {
    return mockUserRepository.authenticate(username, password);
  }

  async getUserProfile(username: string): Promise<UserEntity | undefined> {
    return mockUserRepository.findByUsername(username);
  }
}

export const authService = new AuthService();




