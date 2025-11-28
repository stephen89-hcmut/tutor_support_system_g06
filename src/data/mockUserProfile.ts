import type { UserProfile } from '@/domain/entities/profile';

// Mock user profiles based on role
export const mockUserProfiles: Record<string, UserProfile> = {
  student: {
    userId: 's1',
    username: 'nguyenvana',
    email: 'nguyenvana@hcmut.edu.vn',
    phone: '+84 901 234 567',
    fullName: 'Nguyen Van A',
    initials: 'NVA',
    role: 'Student',
    studentId: '2011234',
    enrollmentYear: 2022,
    major: 'Software Engineering',
    department: 'Computer Science',
    year: 3,
    address: '268 Ly Thuong Kiet Street, District 10, Ho Chi Minh City',
    about: 'Third-year student passionate about software development and AI.',
    skills: ['JavaScript', 'Python', 'React', 'Node.js'],
    lastSynced: '2024-10-28T10:30:00',
    weakSubjects: 'Calculus, Data Structures',
    preferredMode: 'Both',
    preferredTime: 'Morning (8-12), Afternoon (13-17)',
  },
  tutor: {
    userId: 't1',
    username: 'drnguyenvana',
    email: 'drnguyenvana@hcmut.edu.vn',
    phone: '+84 902 345 678',
    fullName: 'Dr. Nguyen Van A',
    initials: 'DNVA',
    role: 'Tutor',
    tutorId: 'T001',
    expertise: ['Data Structures', 'Algorithms', 'System Design'],
    ratingAvg: 4.9,
    department: 'Computer Science',
    address: '123 Le Loi, Ho Chi Minh City',
    about: '10+ years of teaching experience in computer science. Specializing in algorithms and data structures.',
    skills: ['Data Structures', 'Algorithms', 'System Design', 'Machine Learning'],
    lastSynced: '2024-10-28T10:30:00',
  },
  manager: {
    userId: 'm1',
    username: 'manageradmin',
    email: 'manager@hcmut.edu.vn',
    phone: '+84 903 456 789',
    fullName: 'Manager Admin',
    initials: 'MA',
    role: 'Manager',
    managerId: 'M001',
    managerDepartment: 'Administration',
    department: 'Computer Science',
    address: '456 Nguyen Hue, Ho Chi Minh City',
    about: 'System administrator managing the tutor support system.',
    skills: ['System Administration', 'Database Management', 'Security'],
    lastSynced: '2024-10-28T10:30:00',
  },
};

// Get current user profile based on role
export function getCurrentUserProfile(role: 'Student' | 'Tutor' | 'Manager'): UserProfile {
  const roleKey = role.toLowerCase() as 'student' | 'tutor' | 'manager';
  return mockUserProfiles[roleKey];
}

