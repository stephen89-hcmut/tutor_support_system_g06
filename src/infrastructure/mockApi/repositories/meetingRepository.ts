import type { Meeting } from '@/domain/entities/meeting';
import { mockMeetings } from '@/data/mockMeetings';
import { simulateNetworkLatency } from '../utils/network';

class MockMeetingRepository {
  async list(): Promise<Meeting[]> {
    await simulateNetworkLatency();
    return mockMeetings.map((meeting) => ({ ...meeting }));
  }

  async findById(meetingId: string): Promise<Meeting | undefined> {
    await simulateNetworkLatency();
    return mockMeetings.find((meeting) => meeting.id === meetingId);
  }

  async create(meeting: Meeting): Promise<Meeting> {
    await simulateNetworkLatency();
    mockMeetings.push(meeting);
    return meeting;
  }

  async update(meetingId: string, update: Partial<Meeting>): Promise<Meeting | undefined> {
    await simulateNetworkLatency();
    const idx = mockMeetings.findIndex((meeting) => meeting.id === meetingId);
    if (idx === -1) {
      return undefined;
    }
    mockMeetings[idx] = { ...mockMeetings[idx], ...update };
    return mockMeetings[idx];
  }

  async delete(meetingId: string): Promise<boolean> {
    await simulateNetworkLatency();
    const idx = mockMeetings.findIndex((meeting) => meeting.id === meetingId);
    if (idx === -1) return false;
    mockMeetings.splice(idx, 1);
    return true;
  }

  async listByTutor(tutorId: string): Promise<Meeting[]> {
    await simulateNetworkLatency();
    return mockMeetings.filter((meeting) => meeting.tutorId === tutorId).map((meeting) => ({ ...meeting }));
  }

  async listByStudent(studentId: string): Promise<Meeting[]> {
    await simulateNetworkLatency();
    return mockMeetings.filter((meeting) => meeting.studentId === studentId).map((meeting) => ({ ...meeting }));
  }
}

export const mockMeetingRepository = new MockMeetingRepository();



