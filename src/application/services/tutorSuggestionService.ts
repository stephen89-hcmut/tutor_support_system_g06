import type { TutorSuggestion } from '@/domain/entities/tutorSuggestion';
import type { AISuggestionCriteriaDto } from '@/domain/dtos';
import { mockTutorSuggestionRepository } from '@/infrastructure/mockApi/repositories/tutorSuggestionRepository';
import { tutorService } from './tutorService';
import { SuggestionSource, SuggestionStatus } from '@/domain/enums';

class TutorSuggestionService {
  async generateTutorSuggestions(studentId: string, criteria: AISuggestionCriteriaDto): Promise<TutorSuggestion[]> {
    const tutors = await tutorService.list();
    const matches = tutors.map((tutor) => {
      const skillMatch = criteria.preferredSkills
        ? criteria.preferredSkills.filter((skill) => tutor.skills.includes(skill)).length
        : 0;
      const score = 50 + skillMatch * 10;
      const suggestion: TutorSuggestion = {
        suggestionId: `suggest-${studentId}-${tutor.id}`,
        studentId,
        tutorId: tutor.id,
        score,
        reason: 'Auto-generated match',
        createdAt: new Date().toISOString(),
        source: SuggestionSource.RULE_BASED,
        status: SuggestionStatus.PENDING,
      };
      return suggestion;
    });

    for (const suggestion of matches) {
      await mockTutorSuggestionRepository.create(suggestion);
    }

    return matches;
  }

  async acceptSuggestion(suggestionId: string): Promise<boolean> {
    const updated = await mockTutorSuggestionRepository.updateStatus(suggestionId, SuggestionStatus.ACCEPTED);
    return Boolean(updated);
  }

  async rejectSuggestion(suggestionId: string): Promise<boolean> {
    const updated = await mockTutorSuggestionRepository.updateStatus(suggestionId, SuggestionStatus.REJECTED);
    return Boolean(updated);
  }
}

export const tutorSuggestionService = new TutorSuggestionService();


