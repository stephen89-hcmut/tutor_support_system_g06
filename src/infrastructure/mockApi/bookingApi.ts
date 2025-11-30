import type { Meeting, CancelledBy } from '@/domain/entities/meeting';
import type { Role } from '@/contexts/RoleContext';
import { mockMeetingRepository } from './repositories/meetingRepository';
import { simulateNetworkLatency } from './utils/network';

export type BookingApiRole = Exclude<Role, null>;

export class MockBookingApi {
  /**
   * Student: create
   * Tutor:   not allowed
   * Manager: create
   */
  async createMeeting(
    requesterRole: BookingApiRole,
    payload: Omit<Meeting, 'id' | 'status' | 'cancelledBy' | 'cancellationReason'>,
  ): Promise<Meeting | never> {
    await simulateNetworkLatency();

    if (!(requesterRole === 'Student' || requesterRole === 'Manager')) {
      throw new Error('Permission denied: only Student or Manager can create meetings');
    }

    const newMeeting: Meeting = {
      ...payload,
      id: `m-${Date.now()}`,
      status: 'Scheduled',
    };

    return mockMeetingRepository.create(newMeeting);
  }

  /**
   * Student: cancel own meeting
   * Tutor:   cancel own meeting
   * Manager: cancel any meeting
   */
  async cancelMeeting(
    requesterRole: BookingApiRole,
    requesterId: string,
    meetingId: string,
    reason: string,
  ): Promise<Meeting | undefined> {
    await simulateNetworkLatency();

    const meeting = await mockMeetingRepository.findById(meetingId);
    if (!meeting) {
      return undefined;
    }

    if (requesterRole === 'Manager') {
      return mockMeetingRepository.update(meetingId, {
        status: 'Cancelled',
        cancelledBy: 'System',
        cancellationReason: reason,
      });
    }

    if (requesterRole === 'Student' && meeting.studentId !== requesterId) {
      throw new Error('Permission denied: student can only cancel own meetings');
    }

    if (requesterRole === 'Tutor' && meeting.tutorId !== requesterId) {
      throw new Error('Permission denied: tutor can only cancel own meetings');
    }

    const cancelledBy: CancelledBy = requesterRole === 'Student' ? 'Student' : 'Tutor';

    return mockMeetingRepository.update(meetingId, {
      status: 'Cancelled',
      cancelledBy,
      cancellationReason: reason,
    });
  }

  /**
   * Update meeting (time/date/topic...)
   * Student: not allowed (booking chỉ tạo + cancel)
   * Tutor:   update own meetings
   * Manager: update any meeting
   */
  async updateMeeting(
    requesterRole: BookingApiRole,
    requesterId: string,
    meetingId: string,
    update: Partial<Meeting>,
  ): Promise<Meeting | undefined> {
    await simulateNetworkLatency();

    const meeting = await mockMeetingRepository.findById(meetingId);
    if (!meeting) {
      return undefined;
    }

    if (requesterRole === 'Manager') {
      return mockMeetingRepository.update(meetingId, update);
    }

    if (requesterRole === 'Tutor') {
      if (meeting.tutorId !== requesterId) {
        throw new Error('Permission denied: tutor can only update own meetings');
      }
      return mockMeetingRepository.update(meetingId, update);
    }

    throw new Error('Permission denied: student cannot update meetings');
  }

  /**
   * Delete meeting
   * Student: not allowed
   * Tutor:   not allowed
   * Manager: delete any
   */
  async deleteMeeting(
    requesterRole: BookingApiRole,
    meetingId: string,
  ): Promise<boolean> {
    await simulateNetworkLatency();

    if (requesterRole !== 'Manager') {
      throw new Error('Permission denied: only Manager can delete meetings');
    }

    return mockMeetingRepository.delete(meetingId);
  }

  /**
   * Get list meetings by studentId
   * Student: only own id
   * Tutor:   allowed (xem lịch student theo id)
   * Manager: allowed
   */
  async getMeetingsByStudent(
    requesterRole: BookingApiRole,
    requesterId: string,
    studentId: string,
  ): Promise<Meeting[]> {
    await simulateNetworkLatency();

    if (requesterRole === 'Student' && requesterId !== studentId) {
      throw new Error('Permission denied: student can only view own meetings');
    }

    return mockMeetingRepository.listByStudent(studentId);
  }

  /**
   * Get list meetings by tutorId
   * Student: not allowed
   * Tutor:   only own tutorId
   * Manager: allowed
   */
  async getMeetingsByTutor(
    requesterRole: BookingApiRole,
    requesterId: string,
    tutorId: string,
  ): Promise<Meeting[]> {
    await simulateNetworkLatency();

    if (requesterRole === 'Tutor' && requesterId !== tutorId) {
      throw new Error('Permission denied: tutor can only view own meetings');
    }

    if (requesterRole === 'Student') {
      throw new Error('Permission denied: student cannot view meetings by tutor');
    }

    return mockMeetingRepository.listByTutor(tutorId);
  }

  /**
   * Get all meetings
   * Student: not allowed
   * Tutor:   not allowed
   * Manager: allowed
   */
  async getAllMeetings(requesterRole: BookingApiRole): Promise<Meeting[]> {
    await simulateNetworkLatency();

    if (requesterRole !== 'Manager') {
      throw new Error('Permission denied: only Manager can view all meetings');
    }

    return mockMeetingRepository.list();
  }
}

export const mockBookingApi = new MockBookingApi();



