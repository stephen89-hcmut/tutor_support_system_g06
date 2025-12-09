export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'Student' | 'Tutor' | 'Manager';
}

export interface Student extends User {
  majors?: string;
  enrollmentYear?: number;
  department?: string;
  year?: number;
  bio?: string;
}

export interface Tutor extends User {
  expertise?: string[];
  ratingAvg?: number;
  bio?: string;
}

export interface Manager extends User {
  department?: string;
}
