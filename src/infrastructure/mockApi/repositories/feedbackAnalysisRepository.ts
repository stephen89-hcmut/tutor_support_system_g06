import type { FeedbackAnalysisResult } from '@/domain/entities/feedbackAnalysis';
import { simulateNetworkLatency } from '../utils/network';

const analyses: FeedbackAnalysisResult[] = [];

class MockFeedbackAnalysisRepository {
  async list(): Promise<FeedbackAnalysisResult[]> {
    await simulateNetworkLatency();
    return [...analyses];
  }

  async create(result: FeedbackAnalysisResult): Promise<FeedbackAnalysisResult> {
    await simulateNetworkLatency();
    analyses.push(result);
    return result;
  }
}

export const mockFeedbackAnalysisRepository = new MockFeedbackAnalysisRepository();



