import { NotificationType } from '../enums';

export interface Notification {
  notificationId: string;
  toUserId: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: string;
}


