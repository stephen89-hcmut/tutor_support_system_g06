import type { TutorSuggestion } from '@/domain/entities/tutorSuggestion';
import { simulateNetworkLatency } from '../utils/network';

const suggestions: TutorSuggestion[] = [];

class MockTutorSuggestionRepository {
  async listByStudent(studentId: string): Promise<TutorSuggestion[]> {
    await simulateNetworkLatency();
    return suggestions.filter((s) => s.studentId === studentId);
  }

  async create(suggestion: TutorSuggestion): Promise<TutorSuggestion> {
    await simulateNetworkLatency();
    suggestions.push(suggestion);
    return suggestion;
  }

  async updateStatus(suggestionId: string, status: TutorSuggestion['status']): Promise<TutorSuggestion | undefined> {
    await simulateNetworkLatency();
    const idx = suggestions.findIndex((s) => s.suggestionId === suggestionId);
    if (idx === -1) return undefined;
    suggestions[idx] = { ...suggestions[idx], status };
    return suggestions[idx];
  }

  async findById(suggestionId: string): Promise<TutorSuggestion | undefined> {
    await simulateNetworkLatency();
    return suggestions.find((s) => s.suggestionId === suggestionId);
  }
}

export const mockTutorSuggestionRepository = new MockTutorSuggestionRepository();





