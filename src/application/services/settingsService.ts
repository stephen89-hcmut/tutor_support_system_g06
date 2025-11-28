import type { UserSettingsDto } from '@/domain/dtos';

const userSettingsStore: Record<string, UserSettingsDto> = {};

class SettingsService {
  async updateUserSettings(userId: string, settingsData: UserSettingsDto): Promise<boolean> {
    userSettingsStore[userId] = {
      ...(userSettingsStore[userId] ?? {}),
      ...settingsData,
    };
    return true;
  }

  async getUserSettings(userId: string): Promise<UserSettingsDto | undefined> {
    return userSettingsStore[userId];
  }
}

export const settingsService = new SettingsService();



