import { meetingImpl } from '../implementation/meeting.impl';
import { Meeting, CreateMeetingPayload, UpdateMeetingPayload } from '../interfaces';

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const meetingApi = {
  /**
   * GET /api/v1/meetings
   * Query Params: studentId, tutorId, status, fromDate, toDate
   */
  getMeetings: async (filters?: { studentId?: string; tutorId?: string; status?: string }) => {
    await delay(500);
    return meetingImpl.find(filters);
  },

  /**
   * GET /api/v1/meetings/{id}
   */
  getMeetingById: async (id: string): Promise<Meeting> => {
    await delay(300);
    const meeting = meetingImpl.findById(id);
    if (!meeting) throw new Error('Meeting not found');
    return meeting;
  },

  /**
   * POST /api/v1/meetings
   * Create a new meeting
   */
  createMeeting: async (payload: CreateMeetingPayload): Promise<Meeting> => {
    await delay(800);
    return meetingImpl.create(payload);
  },

  /**
   * PUT /api/v1/meetings/{id}
   * Update meeting details
   */
  updateMeeting: async (id: string, payload: UpdateMeetingPayload): Promise<Meeting> => {
    await delay(600);
    const updated = meetingImpl.update(id, payload);
    if (!updated) throw new Error('Meeting update failed');
    return updated;
  },

  /**
   * DELETE /api/v1/meetings/{id}
   * Cancel a meeting
   */
  cancelMeeting: async (id: string, reason?: string): Promise<{ message: string }> => {
    await delay(500);
    const result = meetingImpl.cancel(id, reason);
    if (!result) throw new Error('Meeting cancellation failed');
    return { message: 'Meeting cancelled successfully' };
  },

  /**
   * GET /api/v1/meetings/{id}/join
   * Get meeting join link
   */
  getJoinUrl: async (id: string): Promise<{ joinUrl: string; platform: string }> => {
    await delay(300);
    const joinInfo = meetingImpl.getJoinUrl(id);
    if (!joinInfo) throw new Error('Failed to get join URL');
    return joinInfo;
  },
};
