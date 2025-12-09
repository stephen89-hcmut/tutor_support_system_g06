import type { DashboardSummaryDto } from '@/domain/dtos';
import { mockMeetingRepository } from '@/infrastructure/repositories/meetingRepository';
import { notificationService } from './notificationService';
import { progressService } from './progressService';

class DashboardService {
  async getDashboardSummary(userId: string): Promise<DashboardSummaryDto> {
    const [meetings, notifications, progress] = await Promise.all([
      mockMeetingRepository.list(),
      notificationService.listUserNotifications(userId),
      progressService.getByStudent(userId).catch(() => ({ overall: 0 })),
    ]);

    return {
      upcomingMeetings: meetings.filter((meeting) => meeting.status === 'Scheduled').length,
      completedMeetings: meetings.filter((meeting) => meeting.status === 'Completed').length,
      totalNotifications: notifications.length,
      unreadNotifications: notifications.filter((notification) => !notification.isRead).length,
      progressAverage: (progress as any).overall ?? 0,
    };
  }
}

export const dashboardService = new DashboardService();





