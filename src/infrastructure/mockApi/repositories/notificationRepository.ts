import type { Notification } from '@/domain/entities/notification';
import { simulateNetworkLatency } from '../utils/network';

const notifications: Notification[] = [];

class MockNotificationRepository {
  async listByUser(userId: string): Promise<Notification[]> {
    await simulateNetworkLatency();
    return notifications.filter((notification) => notification.toUserId === userId);
  }

  async create(notification: Notification): Promise<Notification> {
    await simulateNetworkLatency();
    notifications.push(notification);
    return notification;
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    await simulateNetworkLatency();
    const index = notifications.findIndex((n) => n.notificationId === notificationId);
    if (index === -1) return false;
    notifications[index].isRead = true;
    return true;
  }
}

export const mockNotificationRepository = new MockNotificationRepository();



