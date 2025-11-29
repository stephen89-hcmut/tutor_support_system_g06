import { Role } from './user';

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  phone: string;
  fullName: string;
  avatar?: string;
  initials: string;
  role: Role;
  studentId?: string;
  enrollmentYear?: number;
  major?: string;
  department?: string;
  year?: number;
  tutorId?: string;
  expertise?: string[];
  ratingAvg?: number;
  managerId?: string;
  managerDepartment?: string;
  address?: string;
  about?: string;
  skills?: string[];
  lastSynced?: string;
  weakSubjects?: string;
  preferredMode?: 'Online' | 'In-Person' | 'Both';
  preferredTime?: string;
}



