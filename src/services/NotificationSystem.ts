export type NotificationChannel = 'email' | 'push';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface Notification {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  message: string;
  status: NotificationStatus;
  retryCount: number;
  timestamp: Date;
}

export class NotificationManager {
  private static instance: NotificationManager;
  private notifications: Notification[] = [];
  private silentMode: boolean = false;
  private maxRetries: number = 3;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  public setSilentMode(enabled: boolean): void {
    this.silentMode = enabled;
    console.log(`NotificationManager: Silent mode ${enabled ? 'enabled' : 'disabled'}`);
    
    // If silent mode is disabled, process queued notifications
    if (!enabled) {
      this.processQueue();
    }
  }

  public async sendNotification(
    channel: NotificationChannel,
    recipient: string,
    message: string,
    subject?: string
  ): Promise<boolean> {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      channel,
      recipient,
      subject,
      message,
      status: 'pending',
      retryCount: 0,
      timestamp: new Date(),
    };

    this.notifications.push(notification);

    if (this.silentMode) {
      console.log(`NotificationManager: Queued ${channel} notification for ${recipient} (Silent mode)`);
      return true;
    }

    return this.sendWithRetry(notification);
  }

  private async sendWithRetry(notification: Notification): Promise<boolean> {
    while (notification.retryCount < this.maxRetries) {
      try {
        const success = await this.attemptSend(notification);
        if (success) {
          notification.status = 'sent';
          this.logNotification(notification);
          return true;
        } else {
          notification.retryCount++;
          if (notification.retryCount < this.maxRetries) {
            console.log(
              `NotificationManager: Retry ${notification.retryCount}/${this.maxRetries} for ${notification.channel} to ${notification.recipient}`
            );
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * notification.retryCount));
          }
        }
      } catch (error) {
        notification.retryCount++;
        console.error(`NotificationManager: Error sending notification:`, error);
        if (notification.retryCount >= this.maxRetries) {
          notification.status = 'failed';
          return false;
        }
      }
    }

    notification.status = 'failed';
    console.error(`NotificationManager: Failed to send ${notification.channel} notification after ${this.maxRetries} retries`);
    return false;
  }

  private async attemptSend(notification: Notification): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate 90% success rate
    const success = Math.random() > 0.1;

    if (success) {
      this.logNotification(notification);
      return true;
    }

    return false;
  }

  private logNotification(notification: Notification): void {
    if (notification.channel === 'email') {
      console.log(`📧 Email sent to ${notification.recipient}`);
      if (notification.subject) {
        console.log(`   Subject: ${notification.subject}`);
      }
      console.log(`   Message: ${notification.message}`);
    } else if (notification.channel === 'push') {
      console.log(`🔔 Push notification sent to ${notification.recipient}`);
      console.log(`   Message: ${notification.message}`);
    }
  }

  private async processQueue(): Promise<void> {
    const pendingNotifications = this.notifications.filter(n => n.status === 'pending');
    console.log(`NotificationManager: Processing ${pendingNotifications.length} queued notifications`);

    for (const notification of pendingNotifications) {
      await this.sendWithRetry(notification);
    }
  }

  public async sendMultiChannel(
    recipient: string,
    message: string,
    subject?: string
  ): Promise<{ email: boolean; push: boolean }> {
    const emailPromise = this.sendNotification('email', recipient, message, subject);
    const pushPromise = this.sendNotification('push', recipient, message);

    const [emailResult, pushResult] = await Promise.all([emailPromise, pushPromise]);

    return {
      email: emailResult,
      push: pushResult,
    };
  }

  public getNotifications(): Notification[] {
    return [...this.notifications];
  }

  public getNotificationStats(): {
    total: number;
    sent: number;
    failed: number;
    pending: number;
  } {
    return {
      total: this.notifications.length,
      sent: this.notifications.filter(n => n.status === 'sent').length,
      failed: this.notifications.filter(n => n.status === 'failed').length,
      pending: this.notifications.filter(n => n.status === 'pending').length,
    };
  }

  public clearNotifications(): void {
    this.notifications = [];
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();

