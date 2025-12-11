import type { StudentProfile } from '@/domain/entities/student';
import { mockStudentRepository } from '@/infrastructure/repositories/studentRepository';
import { meetingApi } from '@/apis/meeting.api';
import { profileService } from './profileService';
import { authService } from './authService';

export interface TutorStudent {
  studentId: string;
  studentName: string;
  studentCode: string;
  email: string;
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  avgRating: number;
  latestSession?: string;
  department?: string;
}

class StudentService {
  async list(): Promise<StudentProfile[]> {
    return mockStudentRepository.list();
  }

  async getById(studentId: string): Promise<StudentProfile | undefined> {
    return mockStudentRepository.findById(studentId);
  }

  /**
   * Map từ userId của tài khoản (vd: s1, s2, ...) sang StudentProfile demo.
   * Hiện mockStudents có id '1','2',... tương ứng với các student nổi bật.
   */
  async getByAccountUserId(userId: string): Promise<StudentProfile | null> {
    const numeric = parseInt(userId.replace(/^\D+/, ''), 10);
    if (Number.isNaN(numeric)) return null;
    const index = numeric - 1;
    const students = await mockStudentRepository.list();
    if (index < 0 || index >= students.length) return null;
    return students[index];
  }

  /**
   * Get list of students who have participated in meetings with the given tutor
   */
  async getTutorStudents(tutorId: string): Promise<TutorStudent[]> {
    console.log('🔍 getTutorStudents called for tutorId:', tutorId);
    const session = authService.getSession();
    
    // Try to get from dedicated endpoint first
    try {
      console.log('🌐 Attempting dedicated endpoint: /Meetings/tutor/${tutorId}/students');
      const meetings = await meetingApi.getTutorStudents(tutorId, session);
      console.log('✅ Dedicated endpoint returned meetings:', meetings.length);
      return this.mapMeetingsToStudents(meetings, tutorId);
    } catch (apiError) {
      console.warn('⚠️ Dedicated endpoint failed (expected if backend not implemented), error:', apiError);
      console.log('🔄 Falling back to filtering all meetings...');
      
      try {
        // Fallback: Get all meetings and filter by tutorId
        const allMeetings = await meetingApi.getMyMeetings(session);
        console.log('📋 Total meetings from getMyMeetings:', allMeetings.length);
        
        const tutorMeetings = allMeetings.filter(m => m.tutorId === tutorId);
        console.log(`🎯 Filtered meetings for tutor ${tutorId}:`, tutorMeetings.length);
        
        const students = await this.mapMeetingsToStudents(tutorMeetings, tutorId);
        console.log('👥 Mapped to students:', students.length);
        return students;
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        throw fallbackError;
      }
    }
  }

  private async mapMeetingsToStudents(meetings: any[], tutorId: string): Promise<TutorStudent[]> {
    // Group by student
    const studentMap = new Map<string, TutorStudent>();

    for (const meeting of meetings) {
      const studentId = meeting.studentId;
      if (!studentId) continue;

      if (!studentMap.has(studentId)) {
        // Try to get student profile
        let profile = null;
        try {
          profile = await profileService.getProfileByUserId(studentId);
        } catch (err) {
          console.warn(`Could not load profile for student ${studentId}`);
        }

        studentMap.set(studentId, {
          studentId,
          studentName: meeting.studentName || profile?.fullName || 'Unknown Student',
          studentCode: studentId.replace(/[^\d]/g, '').padStart(7, '2011'),
          email: profile?.email || '',
          totalSessions: 0,
          completedSessions: 0,
          upcomingSessions: 0,
          avgRating: 0,
          department: 'Computer Science',
        });
      }

      const student = studentMap.get(studentId)!;
      student.totalSessions++;

      const status = meeting.status;
      if (status === 'Completed') {
        student.completedSessions++;
        if (!student.latestSession || new Date(meeting.startTime) > new Date(student.latestSession)) {
          student.latestSession = meeting.startTime;
        }
      } else if (status === 'Scheduled' || status === 'Confirmed' || status === 'Open' || status === 'Full') {
        student.upcomingSessions++;
      }
    }

    return Array.from(studentMap.values());
  }
}

export const studentService = new StudentService();



