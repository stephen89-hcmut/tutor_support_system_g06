import type { Notification } from '@/domain/entities/notification';
import { NotificationType } from '@/domain/enums';
import { mockNotificationRepository } from '@/infrastructure/mockApi/repositories/notificationRepository';

class NotificationService {
  async sendNotification(toUserId: string, message: string, type: NotificationType, link?: string): Promise<string> {
    const notification: Notification = {
      notificationId: `notif-${Date.now()}`,
      toUserId,
      message,
      type,
      link,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    await mockNotificationRepository.create(notification);
    return notification.notificationId;
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    return mockNotificationRepository.markAsRead(notificationId);
  }

  async listUserNotifications(userId: string): Promise<Notification[]> {
    return mockNotificationRepository.listByUser(userId);
  }
}

export const notificationService = new NotificationService();


