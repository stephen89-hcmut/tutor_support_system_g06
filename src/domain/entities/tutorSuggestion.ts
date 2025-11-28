import { SuggestionSource, SuggestionStatus } from '../enums';

export interface TutorSuggestion {
  suggestionId: string;
  studentId: string;
  tutorId: string;
  score: number;
  reason: string;
  createdAt: string;
  source: SuggestionSource;
  status: SuggestionStatus;
}



