import { meetings, users } from '../mockData/db';
import { Meeting, CreateMeetingPayload, UpdateMeetingPayload } from '../interfaces';

export const meetingImpl = {
  find: (filters?: { studentId?: string; tutorId?: string; status?: string }) => {
    if (!filters) return [...meetings];

    return meetings.filter((m) => {
      let match = true;
      if (filters.studentId && m.student.id !== filters.studentId) match = false;
      if (filters.tutorId && m.tutor.id !== filters.tutorId) match = false;
      if (filters.status && m.status !== filters.status) match = false;
      return match;
    });
  },

  findById: (id: string) => meetings.find((m) => m.meetingId === id),

  create: (data: CreateMeetingPayload) => {
    // Get user names from users list
    const student = users.find((u) => u.id === data.studentId);
    const tutor = users.find((u) => u.id === data.tutorId);

    const newMeeting: Meeting = {
      meetingId: `MT${Date.now()}`,
      title: data.subject,
      status: 'SCHEDULED',
      timeSlot: data.timeSlot,
      student: {
        id: data.studentId,
        name: student?.name || 'Unknown Student',
      },
      tutor: {
        id: data.tutorId,
        name: tutor?.name || 'Unknown Tutor',
      },
      location: data.location || 'Online',
      description: data.description,
      subject: data.subject,
    };

    meetings.push(newMeeting);
    return newMeeting;
  },

  update: (id: string, data: UpdateMeetingPayload) => {
    const index = meetings.findIndex((m) => m.meetingId === id);
    if (index !== -1) {
      meetings[index] = { ...meetings[index], ...data };
      return meetings[index];
    }
    return null;
  },

  cancel: (id: string, reason?: string) => {
    const index = meetings.findIndex((m) => m.meetingId === id);
    if (index !== -1) {
      meetings[index].status = 'CANCELLED';
      meetings[index].description = `Cancelled. Reason: ${reason || 'No reason provided'}`;
      return true;
    }
    return false;
  },

  getJoinUrl: (id: string) => {
    const meeting = meetings.find((m) => m.meetingId === id);
    if (!meeting) return null;

    const platforms = ['Zoom', 'Google Meet', 'Microsoft Teams'];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];

    return {
      joinUrl: `https://${platform.toLowerCase().replace(' ', '')}.com/j/${Math.random().toString(36).substring(7)}`,
      platform: platform,
    };
  },
};
