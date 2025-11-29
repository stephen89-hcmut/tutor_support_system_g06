import type { UserEntity } from '@/domain/entities/user';
import { mockUsers } from '@/data/mockUsers';
import { hashPassword } from '../utils/hashPassword';
import { simulateNetworkLatency } from '../utils/network';

class MockUserRepository {
  async list(): Promise<UserEntity[]> {
    await simulateNetworkLatency();
    return mockUsers.map((user) => ({ ...user }));
  }

  async findById(userId: string): Promise<UserEntity | undefined> {
    await simulateNetworkLatency();
    return mockUsers.find((user) => user.userId === userId);
  }

  async findByUsername(username: string): Promise<UserEntity | undefined> {
    await simulateNetworkLatency();
    return mockUsers.find((user) => user.username === username);
  }

  async authenticate(username: string, password: string): Promise<UserEntity | null> {
    await simulateNetworkLatency();
    const user = mockUsers.find((candidate) => candidate.username === username);
    if (!user) return null;
    const passwordHash = hashPassword(password);
    return user.passwordHash === passwordHash ? user : null;
  }
}

export const mockUserRepository = new MockUserRepository();



