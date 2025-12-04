import type { DateRange } from '@/domain/dtos';
import type { FeedbackAnalysisResult } from '@/domain/entities/feedbackAnalysis';
import { mockFeedbackAnalysisRepository } from '@/infrastructure/repositories/feedbackAnalysisRepository';

class FeedbackAnalysisService {
  async analyzeFeedbackForTutor(tutorId: string, timeRange: DateRange): Promise<FeedbackAnalysisResult> {
    const result: FeedbackAnalysisResult = {
      analysisId: `analysis-${tutorId}-${Date.now()}`,
      tutorId,
      timeRangeStart: timeRange.start,
      timeRangeEnd: timeRange.end,
      averageRating: 4.5,
      positiveRatio: 0.8,
      negativeRatio: 0.2,
      totalFeedback: 10,
      summary: 'AI generated summary.',
      generatedAt: new Date().toISOString(),
    };
    await mockFeedbackAnalysisRepository.create(result);
    return result;
  }

  async analyzeFeedbackForCourse(courseId: string, timeRange: DateRange): Promise<FeedbackAnalysisResult> {
    const result: FeedbackAnalysisResult = {
      analysisId: `analysis-course-${courseId}-${Date.now()}`,
      courseId,
      timeRangeStart: timeRange.start,
      timeRangeEnd: timeRange.end,
      averageRating: 4.0,
      positiveRatio: 0.7,
      negativeRatio: 0.3,
      totalFeedback: 20,
      summary: 'Course feedback overview.',
      generatedAt: new Date().toISOString(),
    };
    await mockFeedbackAnalysisRepository.create(result);
    return result;
  }
}

export const feedbackAnalysisService = new FeedbackAnalysisService();





