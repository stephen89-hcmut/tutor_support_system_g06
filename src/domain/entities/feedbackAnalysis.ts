export interface FeedbackAnalysisResult {
  analysisId: string;
  tutorId?: string;
  courseId?: string;
  timeRangeStart: string;
  timeRangeEnd: string;
  averageRating: number;
  positiveRatio: number;
  negativeRatio: number;
  totalFeedback: number;
  summary?: string;
  generatedAt: string;
}



