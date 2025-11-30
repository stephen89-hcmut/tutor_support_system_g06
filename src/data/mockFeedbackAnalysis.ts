export const mockFeedbackAnalysis = {
  overallSentiment: 'Positive',
  sentimentScore: 4.2,
  avgRatingTrend: '+0.5 ↑',
  totalAnalyzed: 65,
  actionItems: 4,
  
  keyInsights: [
    {
      id: '1',
      text: '95% of feedback is positive or very positive, indicating high student satisfaction',
      icon: '😊',
    },
    {
      id: '2',
      text: 'Explanation clarity is the most frequently praised aspect (25 mentions)',
      icon: '💡',
    },
    {
      id: '3',
      text: 'Teaching pace receives mixed feedback - some students want faster, others slower pace',
      icon: '⚡',
    },
    {
      id: '4',
      text: 'Students consistently request more practice problems and examples',
      icon: '📝',
    },
    {
      id: '5',
      text: 'Your average rating has improved from 4.2 to 4.7 over the last 4 months',
      icon: '📈',
    },
  ],

  performanceMetrics: [
    { metric: 'Communication', value: 85 },
    { metric: 'Preparation', value: 78 },
    { metric: 'Expertise', value: 92 },
    { metric: 'Engagement', value: 88 },
    { metric: 'Responsiveness', value: 80 },
    { metric: 'Patience', value: 95 },
  ],

  sentiment: [
    { name: 'Positive', value: 72 },
    { name: 'Neutral', value: 20 },
    { name: 'Negative', value: 8 },
  ],

  topics: [
    { topic: 'Teaching Quality', mentions: 28 },
    { topic: 'Practice Materials', mentions: 22 },
    { topic: 'Pacing', mentions: 15 },
    { topic: 'Availability', mentions: 8 },
    { topic: 'Communication', mentions: 12 },
  ],

  ratingTrend: [
    { month: 'Jul', rating: 4.0, feedbackCount: 8 },
    { month: 'Aug', rating: 4.1, feedbackCount: 12 },
    { month: 'Sep', rating: 4.3, feedbackCount: 15 },
    { month: 'Oct', rating: 4.7, feedbackCount: 20 },
  ],

  improvements: [
    {
      id: '1',
      title: 'Provide More Practice Problems',
      description: 'Students have requested more practice materials to solidify their understanding. Consider creating a problem bank with detailed solutions.',
      priority: 'High' as const,
    },
    {
      id: '2',
      title: 'Offer Flexible Scheduling',
      description: 'Several students mentioned scheduling conflicts. Offering weekend sessions could improve accessibility.',
      priority: 'High' as const,
    },
    {
      id: '3',
      title: 'Introduce Peer Discussion Groups',
      description: 'Create study groups where students can discuss concepts and support each other between sessions.',
      priority: 'Medium' as const,
    },
    {
      id: '4',
      title: 'Document Session Materials',
      description: 'Share session notes and key concepts in written format for students to review later.',
      priority: 'Medium' as const,
    },
    {
      id: '5',
      title: 'Expand Availability Hours',
      description: 'Consider adding more evening or weekend slots to accommodate different student schedules.',
      priority: 'Low' as const,
    },
  ],
};
