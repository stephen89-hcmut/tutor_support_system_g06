export interface MeetingFeedbackDto {
  meetingId: string;
  studentId: string;
  tutorId: string;
  rating: number; // 1-5 stars
  comment: string;
  suggestedTopics?: string;
}
