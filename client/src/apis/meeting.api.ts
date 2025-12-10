import { httpClient } from '@/lib/httpClient';
import type { MeetingDto } from '@/types/meeting';
import type { AuthSession } from '@/types/auth';

const authToken = (session: AuthSession | null) => session?.accessToken ?? null;

export const meetingApi = {
  getMyMeetings: async (session: AuthSession | null): Promise<MeetingDto[]> => {
    return httpClient.get<MeetingDto[]>('/Meetings', authToken(session));
  },

  getMeetingById: async (id: string, session: AuthSession | null): Promise<MeetingDto> => {
    return httpClient.get<MeetingDto>(`/Meetings/${id}`, authToken(session));
  },

  joinMeeting: async (id: string, session: AuthSession | null): Promise<void> => {
    await httpClient.post<void, Record<string, never>>(`/Meetings/${id}/join`, {}, authToken(session));
  },

  cancelMeeting: async (id: string, reason: string, session: AuthSession | null): Promise<void> => {
    await httpClient.post<void, { reason: string }>(`/Meetings/${id}/cancel`, { reason }, authToken(session));
  },

  createMeeting: async (payload: {
    subject: string;
    startTime: string;
    endTime: string;
    mode: 'Online' | 'InPerson';
    link?: string;
    location?: string;
    tutorId: string;
  }, session: AuthSession | null): Promise<MeetingDto> => {
    return httpClient.post<MeetingDto, typeof payload>('/Meetings', payload, authToken(session));
  },

  startMeeting: async (id: string, session: AuthSession | null): Promise<void> => {
    await httpClient.patch<void, Record<string, never>>(`/Meetings/${id}/start`, {}, authToken(session));
  },

  finishMeeting: async (id: string, session: AuthSession | null): Promise<void> => {
    await httpClient.patch<void, Record<string, never>>(`/Meetings/${id}/finish`, {}, authToken(session));
  },
};
