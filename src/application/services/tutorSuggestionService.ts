import type { TutorSuggestion } from '@/domain/entities/tutorSuggestion';
import type { AISuggestionCriteriaDto } from '@/domain/dtos';
import { mockTutorSuggestionRepository } from '@/infrastructure/mockApi/repositories/tutorSuggestionRepository';
import { tutorService } from './tutorService';
import { progressService } from './progressService';
import { SuggestionSource, SuggestionStatus } from '@/domain/enums';

// Map topics to subject areas
function topicToSubject(topic: string): string {
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('data structure') || topicLower.includes('array') || topicLower.includes('tree') || topicLower.includes('graph') || topicLower.includes('heap')) {
    return 'Data Structures';
  }
  if (topicLower.includes('algorithm') || topicLower.includes('sorting') || topicLower.includes('search') || topicLower.includes('dynamic programming') || topicLower.includes('greedy')) {
    return 'Algorithms';
  }
  if (topicLower.includes('database') || topicLower.includes('sql') || topicLower.includes('normalization') || topicLower.includes('index')) {
    return 'Database Systems';
  }
  if (topicLower.includes('web') || topicLower.includes('html') || topicLower.includes('javascript') || topicLower.includes('react') || topicLower.includes('node')) {
    return 'Web Development';
  }
  if (topicLower.includes('software engineering') || topicLower.includes('design pattern') || topicLower.includes('object-oriented') || topicLower.includes('testing')) {
    return 'Software Engineering';
  }
  if (topicLower.includes('machine learning') || topicLower.includes('neural network') || topicLower.includes('deep learning') || topicLower.includes('classification')) {
    return 'Machine Learning';
  }
  if (topicLower.includes('mathematics') || topicLower.includes('calculus') || topicLower.includes('linear algebra') || topicLower.includes('discrete') || topicLower.includes('probability') || topicLower.includes('statistics')) {
    return 'Mathematics';
  }
  if (topicLower.includes('python')) {
    return 'Python Programming';
  }
  if (topicLower.includes('java')) {
    return 'Java Programming';
  }
  
  // Default fallback
  return topic.split(' - ')[0] || 'General';
}

// Calculate match score between student and tutor (0-100%)
function calculateMatchScore(
  weakSubjects: string[],
  tutorSkills: string[],
  tutorRating: number,
  criteria?: AISuggestionCriteriaDto
): number {
  let score = 0;
  
  // Subject match (60% weight)
  // Check how many weak subjects match tutor's skills
  const matchingSubjects = weakSubjects.filter(subject => 
    tutorSkills.some(skill => 
      skill.toLowerCase().includes(subject.toLowerCase()) || 
      subject.toLowerCase().includes(skill.toLowerCase())
    )
  );
  
  const subjectMatchRatio = weakSubjects.length > 0 
    ? matchingSubjects.length / weakSubjects.length 
    : 0.5; // If no weak subjects, give neutral score
  
  score += subjectMatchRatio * 60;
  
  // Skill overlap (20% weight)
  // Count how many tutor skills are relevant
  const relevantSkills = tutorSkills.filter(skill => 
    weakSubjects.some(subject => 
      skill.toLowerCase().includes(subject.toLowerCase()) || 
      subject.toLowerCase().includes(skill.toLowerCase())
    )
  );
  
  const skillOverlapRatio = tutorSkills.length > 0 
    ? relevantSkills.length / tutorSkills.length 
    : 0;
  
  score += skillOverlapRatio * 20;
  
  // Rating factor (15% weight)
  // Normalize rating from 3.5-5.0 to 0-1, then scale to 15%
  const normalizedRating = (tutorRating - 3.5) / 1.5; // 0 to 1
  score += normalizedRating * 15;
  
  // Criteria match (5% weight)
  if (criteria) {
    let criteriaMatch = 0;
    
    if (criteria.department) {
      // This would need tutor department info - simplified for now
      criteriaMatch += 0.02;
    }
    
    if (criteria.meetingMode) {
      // This would need tutor meeting mode - simplified for now
      criteriaMatch += 0.02;
    }
    
    score += criteriaMatch * 5;
  }
  
  // Ensure score is between 0 and 100
  return Math.min(100, Math.max(0, Math.round(score)));
}

// Generate reason for suggestion
function generateReason(weakSubjects: string[], matchingSubjects: string[], tutorName: string): string {
  if (matchingSubjects.length > 0) {
    return `${tutorName} specializes in ${matchingSubjects.slice(0, 2).join(' and ')}, which matches your areas needing improvement: ${weakSubjects.slice(0, 2).join(', ')}.`;
  }
  return `${tutorName} has strong expertise that can help improve your academic performance.`;
}

class TutorSuggestionService {
  async generateTutorSuggestions(studentId: string, criteria?: AISuggestionCriteriaDto): Promise<TutorSuggestion[]> {
    // Get all tutors
    const tutors = await tutorService.list();
    
    // Get student progress records
    let weakSubjects: string[] = [];
    try {
      const progressData = await progressService.getByStudent(studentId);
      
      if (progressData.records && progressData.records.length > 0) {
        // Analyze progress to find weak subjects
        const subjectScores: Record<string, number[]> = {};
        
        progressData.records.forEach(record => {
          const subject = topicToSubject(record.topic);
          if (!subjectScores[subject]) {
            subjectScores[subject] = [];
          }
          // Average of understanding, problemSolving, codeQuality, participation
          const avgScore = (
            record.understanding + 
            record.problemSolving + 
            record.codeQuality + 
            record.participation
          ) / 4;
          subjectScores[subject].push(avgScore);
        });
        
        // Find subjects with average score < 60 (weak subjects)
        weakSubjects = Object.entries(subjectScores)
          .filter(([_, scores]) => {
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            return avg < 60;
          })
          .map(([subject, _]) => subject);
        
        // If no weak subjects found, use all subjects with below-average performance
        if (weakSubjects.length === 0) {
          const allAverages = Object.entries(subjectScores).map(([_, scores]) => 
            scores.reduce((a, b) => a + b, 0) / scores.length
          );
          const overallAvg = allAverages.reduce((a, b) => a + b, 0) / allAverages.length;
          
          weakSubjects = Object.entries(subjectScores)
            .filter(([_, scores]) => {
              const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
              return avg < overallAvg;
            })
            .map(([subject, _]) => subject);
        }
      }
    } catch (error) {
      console.warn('Could not fetch student progress, using criteria-based matching:', error);
    }
    
    // If no weak subjects found and no criteria, use default matching
    if (weakSubjects.length === 0 && (!criteria || !criteria.preferredSkills || criteria.preferredSkills.length === 0)) {
      // Use a generic approach - match based on common subjects
      weakSubjects = ['Data Structures', 'Algorithms', 'Software Engineering'];
    }
    
    // If criteria has preferred skills, use those as weak subjects
    if (criteria?.preferredSkills && criteria.preferredSkills.length > 0) {
      weakSubjects = [...new Set([...weakSubjects, ...criteria.preferredSkills])];
    }
    
    // Calculate match scores for all tutors
    const matches = tutors.map((tutor) => {
      const score = calculateMatchScore(weakSubjects, tutor.skills, tutor.rating, criteria);
      
      const matchingSubjects = weakSubjects.filter(subject => 
        tutor.skills.some(skill => 
          skill.toLowerCase().includes(subject.toLowerCase()) || 
          subject.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      const reason = generateReason(weakSubjects, matchingSubjects, tutor.name);
      
      const suggestion: TutorSuggestion = {
        suggestionId: `suggest-${studentId}-${tutor.id}`,
        studentId,
        tutorId: tutor.id,
        score,
        reason,
        createdAt: new Date().toISOString(),
        source: SuggestionSource.AI,
        status: SuggestionStatus.PENDING,
      };
      
      return suggestion;
    });
    
    // Sort by score (highest first) and take top 5
    const sortedMatches = [...matches].sort((a, b) => b.score - a.score);
    const persistedMatches = sortedMatches.slice(0, 15);

    // Save a subset to avoid unbounded memory usage
    for (const suggestion of persistedMatches) {
      await mockTutorSuggestionRepository.create(suggestion);
    }
    
    return sortedMatches;
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
