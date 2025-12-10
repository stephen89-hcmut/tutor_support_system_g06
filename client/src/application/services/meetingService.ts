import type { Meeting } from '@/domain/entities/meeting';
import { meetingApi } from '@/apis/meeting.api';
import { authService } from './authService';
import type { AuthSession } from '@/types/auth';
import type { MeetingDto } from '@/types/meeting';

// Map API dto to UI-friendly Meeting and enrich with current user identity
const toMeeting = (dto: MeetingDto, session: AuthSession | null): Meeting => {
  const start = new Date(dto.startTime);

  const statusMap: Record<string, Meeting['status']> = {
    Open: 'Scheduled',
    Full: 'Scheduled',
    Completed: 'Completed',
    Started: 'In Progress',
    CancelledByTutor: 'Cancelled',
    CancelledBySystem: 'Cancelled',
    CancelledByStudent: 'Cancelled',
  };

  const isStudent = session?.role === 'Student';

  return {
    id: dto.id,
    date: start.toISOString().split('T')[0],
    time: start.toISOString(),
    // Backend currently omits student fields; fall back to the authenticated student for filtering
    studentId: dto.studentId ?? (isStudent ? session?.userId ?? '' : ''),
    studentName: dto.studentName ?? (isStudent ? session?.fullName ?? 'Bạn' : ''),
    tutorId: dto.tutorId,
    tutorName: dto.tutorName,
    topic: dto.subject,
    mode: dto.mode === 'Online' ? 'Zoom' : 'In-Person',
    location: dto.location ?? dto.link,
    link: dto.link,
    status: statusMap[dto.status] ?? 'Scheduled',
  };
};

class MeetingService {
  async getAll(): Promise<Meeting[]> {
    const session = authService.getSession();
    const items = await meetingApi.getMyMeetings(session);
    return items.map((dto) => toMeeting(dto, session));
  }

  async getById(meetingId: string): Promise<Meeting | undefined> {
    const session = authService.getSession();
    const dto = await meetingApi.getMeetingById(meetingId, session);
    return toMeeting(dto);
  }

  async getByTutor(tutorId: string): Promise<Meeting[]> {
    const meetings = await this.getAll();
    return meetings.filter((m) => m.tutorId === tutorId);
  }

  async getByStudent(studentId: string): Promise<Meeting[]> {
    const meetings = await this.getAll();
    return meetings.filter((m) => m.studentId === studentId);
  }

  async getListMeetingByStudentId(studentId: string): Promise<Meeting[]> {
    return this.getByStudent(studentId);
  }

  async schedule(meeting: Meeting): Promise<Meeting> {
    const session = authService.getSession();
    const dto = await meetingApi.createMeeting(
      {
        subject: meeting.topic,
        startTime: meeting.time,
        endTime: meeting.time,
        mode: meeting.mode === 'In-Person' ? 'InPerson' : 'Online',
        link: meeting.link,
        location: meeting.location,
        tutorId: meeting.tutorId,
      },
      session,
    );
    return toMeeting(dto);
  }

  async update(meetingId: string, update: Partial<Meeting>): Promise<Meeting | undefined> {
    // Server does not support partial update yet; fetch detail to preserve local info
    const current = await this.getById(meetingId);
    if (!current) return undefined;
    const merged = { ...current, ...update };
    return merged;
  }

  async cancel(meetingId: string, cancelledBy: Meeting['cancelledBy'], reason: string) {
    const session = authService.getSession();
    await meetingApi.cancelMeeting(meetingId, reason, session);
    return this.getById(meetingId);
  }

  async checkConflict(tutorId: string, date: string, time: string) {
    const meetings = await this.getByTutor(tutorId);
    return meetings.some((meeting) => meeting.date === date && meeting.time === time && meeting.status === 'Scheduled');
  }
}

export const meetingService = new MeetingService();




