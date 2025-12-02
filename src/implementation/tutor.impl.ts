import { meetings, feedbacks, progressRecords, users } from '../mockData/db';
import { ProgressRecord, CreateProgressPayload } from '../interfaces';

export const tutorImpl = {
  getStudentsByTutor: (
    tutorId: string,
    options?: { page?: number; limit?: number; search?: string }
  ) => {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const search = options?.search?.toLowerCase() || '';

    // Find unique students who have meetings with this tutor
    const uniqueStudentIds = new Set<string>();
    const studentInfo: Map<string, { lastMeetingDate: string; totalSessions: number }> = new Map();

    meetings.forEach((m) => {
      if (m.tutor.id === tutorId) {
        uniqueStudentIds.add(m.student.id);
        const current = studentInfo.get(m.student.id);
        studentInfo.set(m.student.id, {
          lastMeetingDate: m.timeSlot.startTime > (current?.lastMeetingDate || '') ? m.timeSlot.startTime : current?.lastMeetingDate || '',
          totalSessions: (current?.totalSessions || 0) + 1,
        });
      }
    });

    let results = Array.from(uniqueStudentIds).map((studentId) => {
      const user = users.find((u) => u.id === studentId);
      const info = studentInfo.get(studentId)!;
      return {
        studentId: studentId,
        fullName: user?.name || 'Unknown',
        avatarUrl: user?.avatarUrl || 'https://via.placeholder.com/50',
        lastMeetingDate: new Date(info.lastMeetingDate).toISOString().split('T')[0],
        totalSessions: info.totalSessions,
      };
    });

    // Filter by search
    if (search) {
      results = results.filter((s) => s.fullName.toLowerCase().includes(search));
    }

    // Pagination
    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;

    return results.slice(startIdx, endIdx);
  },

  getStudentProfile: (studentId: string) => {
    return users.find((u) => u.id === studentId);
  },

  getStudentHistory: (studentId: string, tutorId?: string) => {
    let filtered = meetings.filter((m) => m.student.id === studentId);
    if (tutorId) {
      filtered = filtered.filter((m) => m.tutor.id === tutorId);
    }
    return filtered;
  },

  getProgressRecords: (studentId: string, sessionId?: string) => {
    let filtered = progressRecords.filter((p) => p.studentId === studentId);
    if (sessionId) {
      filtered = filtered.filter((p) => p.sessionId === sessionId);
    }
    return filtered;
  },

  createProgressRecord: (data: CreateProgressPayload) => {
    const newRecord: ProgressRecord = {
      id: `PR${Date.now()}`,
      sessionId: data.sessionId,
      studentId: data.studentId,
      tutorId: data.tutorId,
      score: data.score,
      summary: data.summary,
      skillsImproved: data.skillsImproved,
      createdAt: new Date().toISOString(),
    };
    progressRecords.push(newRecord);
    return newRecord;
  },

  getTutorFeedbacks: (tutorId: string) => {
    return feedbacks.filter((f) => f.tutorId === tutorId);
  },

  replyFeedback: (feedbackId: string, content: string) => {
    const fb = feedbacks.find((f) => f.id === feedbackId);
    if (fb) {
      fb.reply = content;
      fb.replyDate = new Date().toISOString();
      return true;
    }
    return false;
  },
};
