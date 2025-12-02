import type { Meeting } from '@/domain/entities/meeting';
import { meetings as newMeetings } from '@/mockData/db';
import { simulateNetworkLatency } from '../utils/network';

// Convert new meeting format to old meeting format
const convertNewToOldMeeting = (newMeeting: any): Meeting => {
  const startTime = new Date(newMeeting.timeSlot.startTime);
  const date = startTime.toISOString().split('T')[0];
  const time = `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`;
  const statusMap: Record<string, string> = {
    'SCHEDULED': 'Scheduled',
    'COMPLETED': 'Completed',
    'CANCELLED': 'Cancelled',
  };

  return {
    id: newMeeting.meetingId,
    date,
    time,
    studentId: newMeeting.student.id,
    studentName: newMeeting.student.name,
    tutorId: newMeeting.tutor.id,
    tutorName: newMeeting.tutor.name,
    topic: newMeeting.subject || newMeeting.title,
    mode: (newMeeting.location === 'Zoom' ? 'Zoom' : 
            newMeeting.location === 'Teams' ? 'Teams' : 'In-Person') as any,
    location: newMeeting.location,
    link: newMeeting.link,
    status: statusMap[newMeeting.status] as any,
    notes: newMeeting.description,
  };
};

// In-memory storage for meetings created during session
let meetingCache: Meeting[] = newMeetings.map(convertNewToOldMeeting);

class MockMeetingRepository {
  async list(): Promise<Meeting[]> {
    await simulateNetworkLatency();
    return meetingCache.map((meeting) => ({ ...meeting }));
  }

  async findById(meetingId: string): Promise<Meeting | undefined> {
    await simulateNetworkLatency();
    return meetingCache.find((meeting) => meeting.id === meetingId);
  }

  async create(meeting: Meeting): Promise<Meeting> {
    await simulateNetworkLatency();
    meetingCache.push(meeting);
    return meeting;
  }

  async update(meetingId: string, update: Partial<Meeting>): Promise<Meeting | undefined> {
    await simulateNetworkLatency();
    const idx = meetingCache.findIndex((meeting) => meeting.id === meetingId);
    if (idx === -1) {
      return undefined;
    }
    meetingCache[idx] = { ...meetingCache[idx], ...update };
    return meetingCache[idx];
  }

  async delete(meetingId: string): Promise<boolean> {
    await simulateNetworkLatency();
    const idx = meetingCache.findIndex((meeting) => meeting.id === meetingId);
    if (idx === -1) return false;
    meetingCache.splice(idx, 1);
    return true;
  }

  async listByTutor(tutorId: string): Promise<Meeting[]> {
    await simulateNetworkLatency();
    return meetingCache.filter((meeting) => meeting.tutorId === tutorId).map((meeting) => ({ ...meeting }));
  }

  async listByStudent(studentId: string): Promise<Meeting[]> {
    await simulateNetworkLatency();
    return meetingCache.filter((meeting) => meeting.studentId === studentId).map((meeting) => ({ ...meeting }));
  }
}

export const mockMeetingRepository = new MockMeetingRepository();



