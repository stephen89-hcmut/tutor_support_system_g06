import type { Meeting } from '@/domain/entities/meeting';
import { mockMeetingRepository } from '@/infrastructure/repositories/meetingRepository';

class MeetingService {
  async getAll(): Promise<Meeting[]> {
    return mockMeetingRepository.list();
  }

  async getById(meetingId: string): Promise<Meeting | undefined> {
    return mockMeetingRepository.findById(meetingId);
  }

  async getByTutor(tutorId: string): Promise<Meeting[]> {
    return mockMeetingRepository.listByTutor(tutorId);
  }

  async getByStudent(studentId: string): Promise<Meeting[]> {
    return mockMeetingRepository.listByStudent(studentId);
  }

  async getListMeetingByStudentId(studentId: string): Promise<Meeting[]> {
    return mockMeetingRepository.listByStudent(studentId);
  }

  async schedule(meeting: Meeting): Promise<Meeting> {
    return mockMeetingRepository.create(meeting);
  }

  async update(meetingId: string, update: Partial<Meeting>): Promise<Meeting | undefined> {
    return mockMeetingRepository.update(meetingId, update);
  }

  async cancel(meetingId: string, cancelledBy: Meeting['cancelledBy'], reason: string) {
    return mockMeetingRepository.update(meetingId, {
      status: 'Cancelled',
      cancelledBy,
      cancellationReason: reason,
    });
  }

  async checkConflict(tutorId: string, date: string, time: string) {
    const meetings = await this.getByTutor(tutorId);
    return meetings.some((meeting) => meeting.date === date && meeting.time === time && meeting.status === 'Scheduled');
  }
}

export const meetingService = new MeetingService();




