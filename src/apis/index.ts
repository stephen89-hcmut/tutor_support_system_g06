// Export all APIs from a single entry point
export { meetingApi } from './meeting.api';
export { tutorApi } from './tutor.api';
export { studentApi } from './student.api';

// Example usage:
// import { meetingApi, tutorApi, studentApi } from '@/apis';
//
// // Get meetings for a student
// const meetings = await meetingApi.getMeetings({ studentId: 's1' });
//
// // Get tutor's students
// const students = await tutorApi.getMyStudents('t1');
//
// // Get student profile
// const profile = await studentApi.getProfile('s1');
