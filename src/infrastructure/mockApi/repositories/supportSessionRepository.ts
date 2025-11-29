import type { SupportSession } from '@/domain/entities/supportSession';
import { simulateNetworkLatency } from '../utils/network';

const supportSessions: SupportSession[] = [];

class MockSupportSessionRepository {
  async list(): Promise<SupportSession[]> {
    await simulateNetworkLatency();
    return [...supportSessions];
  }

  async create(session: SupportSession): Promise<SupportSession> {
    await simulateNetworkLatency();
    supportSessions.push(session);
    return session;
  }

  async findById(sessionId: string): Promise<SupportSession | undefined> {
    await simulateNetworkLatency();
    return supportSessions.find((session) => session.sessionId === sessionId);
  }
}

export const mockSupportSessionRepository = new MockSupportSessionRepository();




