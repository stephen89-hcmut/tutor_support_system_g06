import type { TutorProfile } from '@/domain/entities/tutor';
import { tutorService } from './tutorService';

interface TutorSuggestionParams {
  preferredSkills?: string[];
  meetingMode?: TutorProfile['meetingMode'];
  department?: string;
}

class AiService {
  async getTutorSuggestions(params: TutorSuggestionParams = {}): Promise<TutorProfile[]> {
    const tutors = await tutorService.list();
    const { preferredSkills = [], meetingMode, department } = params;

    return tutors
      .map((tutor) => {
        const skillScore = preferredSkills.length
          ? preferredSkills.filter((skill) => tutor.skills.includes(skill)).length / preferredSkills.length
          : 0.5;
        const modeScore = meetingMode ? (tutor.meetingMode === meetingMode ? 1 : 0) : 0.5;
        const deptScore = department ? (tutor.department === department ? 1 : 0) : 0.5;

        const matchScore = Math.round(((skillScore + modeScore + deptScore) / 3) * 100);
        return { ...tutor, matchScore };
      })
      .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  }
}

export const aiService = new AiService();



