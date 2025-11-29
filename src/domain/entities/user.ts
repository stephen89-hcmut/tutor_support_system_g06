export type Role = 'Student' | 'Tutor' | 'Manager';

export interface BaseUser {
  userId: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  role: Role;
}

export interface StudentAccount extends BaseUser {
  role: 'Student';
  studentId: string;
  enrollmentYear: number;
  majors: string;
}

export interface TutorAccount extends BaseUser {
  role: 'Tutor';
  tutorId: string;
  expertise: string[];
  ratingAvg: number;
  isInstructor?: boolean;
}

export interface ManagerAccount extends BaseUser {
  role: 'Manager';
  managerId: string;
  department: string;
}

export type UserEntity = StudentAccount | TutorAccount | ManagerAccount;

export function getUserDisplayName(user: UserEntity): string {
  if (user.role === 'Student') {
    return `${user.studentId} - ${user.username}`;
  }
  if (user.role === 'Tutor') {
    return `${user.tutorId} - ${user.username}`;
  }
  return `${user.managerId} - ${user.username}`;
}



