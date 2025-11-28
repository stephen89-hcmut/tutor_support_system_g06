import type { Feedback } from '@/domain/entities/feedback';
import { simulateNetworkLatency } from '../utils/network';

const feedbackStore: Feedback[] = [];

class MockFeedbackRepository {
  async listBySession(sessionId: string): Promise<Feedback[]> {
    await simulateNetworkLatency();
    return feedbackStore.filter((f) => f.sessionId === sessionId);
  }

  async create(feedback: Feedback): Promise<Feedback> {
    await simulateNetworkLatency();
    feedbackStore.push(feedback);
    return feedback;
  }

  async findById(feedbackId: string): Promise<Feedback | undefined> {
    await simulateNetworkLatency();
    return feedbackStore.find((f) => f.feedbackId === feedbackId);
  }

  async update(feedbackId: string, update: Partial<Feedback>): Promise<Feedback | undefined> {
    await simulateNetworkLatency();
    const index = feedbackStore.findIndex((f) => f.feedbackId === feedbackId);
    if (index === -1) return undefined;
    feedbackStore[index] = { ...feedbackStore[index], ...update };
    return feedbackStore[index];
  }
}

export const mockFeedbackRepository = new MockFeedbackRepository();


