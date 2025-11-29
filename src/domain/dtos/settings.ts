export interface UserSettingsDto {
  theme?: 'light' | 'dark' | 'system';
  notificationsEnabled?: boolean;
  language?: string;
}

export interface DashboardSummaryDto {
  upcomingMeetings: number;
  completedMeetings: number;
  totalNotifications: number;
  unreadNotifications: number;
  progressAverage: number;
}




