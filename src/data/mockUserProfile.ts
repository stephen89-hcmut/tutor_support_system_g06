import type { UserProfile } from '@/domain/entities/profile';
import { mockStudentAccounts, mockTutorAccounts, mockManagerAccounts } from './mockUsers';

// Helper to get full name from username
function getFullName(username: string, role: 'Student' | 'Tutor' | 'Manager'): string {
  if (role === 'Student') {
    const name = username.replace('sv.', '');
    // Convert "nguyenvana" to "Nguyen Van A"
    return name.split('').map((c, i) => i === 0 ? c.toUpperCase() : c).join(' ');
  } else if (role === 'Tutor') {
    if (username.startsWith('tutor.')) {
      const name = username.replace('tutor.', '');
      return `Dr. ${name.charAt(0).toUpperCase() + name.slice(1)}`;
    }
    return `Dr. ${username.charAt(0).toUpperCase() + username.slice(1)}`;
  } else {
    // Manager
    if (username.startsWith('manager.')) {
      const name = username.replace('manager.', '');
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return username.charAt(0).toUpperCase() + username.slice(1);
  }
}

// Helper to get initials
function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 4);
}

// Generate student profiles
const studentProfiles: Record<string, UserProfile> = {};
mockStudentAccounts.forEach((student) => {
  const fullName = getFullName(student.username, 'Student');
  studentProfiles[student.userId] = {
    userId: student.userId,
    username: student.username,
    email: student.email,
    phone: `+84 ${900 + Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 1000)} ${Math.floor(Math.random() * 1000)}`,
    fullName,
    initials: getInitials(fullName),
    role: 'Student',
    studentId: student.studentId,
    enrollmentYear: student.enrollmentYear,
    major: student.majors,
    department: 'Computer Science',
    year: new Date().getFullYear() - student.enrollmentYear + 1,
    address: '268 Ly Thuong Kiet Street, District 10, Ho Chi Minh City',
    about: `${student.enrollmentYear} student passionate about ${student.majors}.`,
    skills: ['JavaScript', 'Python', 'React', 'Node.js'],
    lastSynced: new Date().toISOString(),
    weakSubjects: 'Calculus, Data Structures',
    preferredMode: 'Both',
    preferredTime: 'Morning (8-12), Afternoon (13-17)',
  };
});

// Generate tutor profiles
const tutorProfiles: Record<string, UserProfile> = {};
mockTutorAccounts.forEach((tutor) => {
  const fullName = getFullName(tutor.username, 'Tutor');
  tutorProfiles[tutor.userId] = {
    userId: tutor.userId,
    username: tutor.username,
    email: tutor.email,
    phone: `+84 ${900 + Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 1000)} ${Math.floor(Math.random() * 1000)}`,
    fullName,
    initials: getInitials(fullName),
    role: 'Tutor',
    tutorId: tutor.tutorId,
    expertise: tutor.expertise,
    ratingAvg: tutor.ratingAvg,
    department: 'Computer Science',
    address: '123 Le Loi, Ho Chi Minh City',
    about: `Experienced ${tutor.isInstructor ? 'instructor' : 'tutor'} specializing in ${tutor.expertise.join(', ')}.`,
    skills: tutor.expertise,
    lastSynced: new Date().toISOString(),
  };
});

// Generate manager profiles
const managerProfiles: Record<string, UserProfile> = {};
mockManagerAccounts.forEach((manager) => {
  const fullName = getFullName(manager.username, 'Manager');
  managerProfiles[manager.userId] = {
    userId: manager.userId,
    username: manager.username,
    email: manager.email,
    phone: `+84 ${900 + Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 1000)} ${Math.floor(Math.random() * 1000)}`,
    fullName,
    initials: getInitials(fullName),
    role: 'Manager',
    managerId: manager.managerId,
    managerDepartment: manager.department,
    department: manager.department,
    address: '456 Nguyen Hue, Ho Chi Minh City',
    about: 'System administrator managing the tutor support system.',
    skills: ['System Administration', 'Database Management', 'Security'],
    lastSynced: new Date().toISOString(),
  };
});

// Combine all profiles
export const mockUserProfiles: Record<string, UserProfile> = {
  ...studentProfiles,
  ...tutorProfiles,
  ...managerProfiles,
};

// Get current user profile based on role (for backward compatibility)
export function getCurrentUserProfile(role: 'Student' | 'Tutor' | 'Manager'): UserProfile {
  const roleKey = role.toLowerCase() as 'student' | 'tutor' | 'manager';
  // Return first profile of that role
  const profiles = Object.values(mockUserProfiles).filter(p => p.role === role);
  return profiles[0] || mockUserProfiles[roleKey];
}

// Get profile by userId
export function getUserProfile(userId: string): UserProfile | undefined {
  return mockUserProfiles[userId];
}
