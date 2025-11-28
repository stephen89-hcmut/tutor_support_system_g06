import { ManagerAccount, StudentAccount, TutorAccount, UserEntity } from '@/domain/entities/user';
import { hashPassword } from '@/infrastructure/mockApi/utils/hashPassword';

// Vietnamese first names
const firstNames = [
  'An', 'Anh', 'Bao', 'Binh', 'Chau', 'Cuong', 'Dang', 'Duc', 'Giang', 'Hai',
  'Hang', 'Hieu', 'Hoang', 'Hung', 'Khanh', 'Lan', 'Linh', 'Long', 'Mai', 'Minh',
  'Nam', 'Nga', 'Ngoc', 'Nhung', 'Phong', 'Phuong', 'Quang', 'Quy', 'Son', 'Tam',
  'Thanh', 'Thao', 'Thi', 'Thuy', 'Tien', 'Trang', 'Trung', 'Tuan', 'Van', 'Viet',
  'Vinh', 'Xuan', 'Yen', 'Dung', 'Hoa', 'Khoa', 'Luan', 'My', 'Nhan', 'Oanh'
];

// Vietnamese last names
const lastNames = [
  'Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vu', 'Vo', 'Dang', 'Bui', 'Do',
  'Ho', 'Ngo', 'Duong', 'Ly', 'Truong', 'Phan', 'Dinh', 'Ton', 'Lam', 'Cao'
];

// Majors
const majors = [
  'Software Engineering',
  'Computer Science',
  'Information Systems',
  'Data Science',
  'Computer Engineering',
  'Cybersecurity',
  'Artificial Intelligence',
  'Network Engineering'
];

// Skills/Subjects for tutors
const allSubjects = [
  'Data Structures', 'Algorithms', 'System Design', 'Database Systems',
  'Software Engineering', 'Machine Learning', 'Artificial Intelligence',
  'Web Development', 'Mobile Development', 'Computer Networks',
  'Cybersecurity', 'Mathematics', 'Statistics', 'Calculus',
  'Python Programming', 'Java Programming', 'C++ Programming',
  'JavaScript', 'React', 'Node.js', 'Object-Oriented Design',
  'System Programming', 'Data Science', 'Big Data', 'Cloud Computing'
];

// Departments
const departments = [
  'Computer Science',
  'Software Engineering',
  'Information Systems',
  'Mathematics',
  'Data Science'
];

// Helper function to generate random name
function generateName(): string {
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  return `${lastName} ${firstName}`;
}

// Helper function to generate username from name
function generateUsername(name: string, index: number): string {
  const parts = name.toLowerCase().split(' ');
  const lastPart = parts[parts.length - 1];
  const firstPart = parts[0].substring(0, 3);
  return `${lastPart}${firstPart}${index}`;
}

const featuredStudents: StudentAccount[] = [
  {
    userId: 's1',
    username: 'sv.nguyenvana',
    email: 'sv.nguyenvana@hcmut.edu.vn',
    passwordHash: hashPassword('student123'),
    createdAt: '2023-09-01T00:00:00',
    role: 'Student',
    studentId: '20230001',
    enrollmentYear: 2023,
    majors: 'Software Engineering',
  },
  {
    userId: 's2',
    username: 'sv.tranthib',
    email: 'sv.tranthib@hcmut.edu.vn',
    passwordHash: hashPassword('student123'),
    createdAt: '2022-09-01T00:00:00',
    role: 'Student',
    studentId: '20220002',
    enrollmentYear: 2022,
    majors: 'Computer Science',
  },
  {
    userId: 's3',
    username: 'sv.levanc',
    email: 'sv.levanc@hcmut.edu.vn',
    passwordHash: hashPassword('student123'),
    createdAt: '2021-09-01T00:00:00',
    role: 'Student',
    studentId: '20210003',
    enrollmentYear: 2021,
    majors: 'Information Systems',
  },
  {
    userId: 's4',
    username: 'sv.phamthid',
    email: 'sv.phamthid@hcmut.edu.vn',
    passwordHash: hashPassword('student123'),
    createdAt: '2020-09-01T00:00:00',
    role: 'Student',
    studentId: '20200004',
    enrollmentYear: 2020,
    majors: 'Data Science',
  },
  {
    userId: 's5',
    username: 'sv.hoangvane',
    email: 'sv.hoangvane@hcmut.edu.vn',
    passwordHash: hashPassword('student123'),
    createdAt: '2020-09-01T00:00:00',
    role: 'Student',
    studentId: '20200005',
    enrollmentYear: 2020,
    majors: 'Computer Engineering',
  },
];

const randomStudentCount = 525 - featuredStudents.length;
const generatedStudents: StudentAccount[] = Array.from({ length: randomStudentCount }, (_, i) => {
  const index = i + featuredStudents.length + 1;
  const name = generateName();
  const username = generateUsername(name, index);
  const enrollmentYear = 2020 + Math.floor(Math.random() * 5); // 2020-2024
  const studentId = `${enrollmentYear}${String(index).padStart(4, '0')}`;

  return {
    userId: `s${index}`,
    username,
    email: `${username}@hcmut.edu.vn`,
    passwordHash: hashPassword('student123'),
    createdAt: `${enrollmentYear}-09-01T00:00:00`,
    role: 'Student',
    studentId,
    enrollmentYear,
    majors: majors[Math.floor(Math.random() * majors.length)],
  };
});

export const mockStudentAccounts: StudentAccount[] = [...featuredStudents, ...generatedStudents];

const featuredTutors: TutorAccount[] = [
  {
    userId: 't1',
    username: 'tutor.nguyenvana',
    email: 'tutor.nguyenvana@hcmut.edu.vn',
    passwordHash: hashPassword('tutor123'),
    createdAt: '2019-01-01T00:00:00',
    role: 'Tutor',
    tutorId: 'T001',
    expertise: ['Data Structures', 'Algorithms', 'System Design'],
    ratingAvg: 4.9,
    isInstructor: true,
  },
  {
    userId: 't2',
    username: 'tutor.tranthib',
    email: 'tutor.tranthib@hcmut.edu.vn',
    passwordHash: hashPassword('tutor123'),
    createdAt: '2019-01-01T00:00:00',
    role: 'Tutor',
    tutorId: 'T002',
    expertise: ['Database Systems', 'Software Engineering', 'Web Development'],
    ratingAvg: 4.7,
    isInstructor: true,
  },
  {
    userId: 't3',
    username: 'tutor.levanc',
    email: 'tutor.levanc@hcmut.edu.vn',
    passwordHash: hashPassword('tutor123'),
    createdAt: '2020-01-01T00:00:00',
    role: 'Tutor',
    tutorId: 'T003',
    expertise: ['Machine Learning', 'Artificial Intelligence', 'Data Science'],
    ratingAvg: 4.8,
    isInstructor: true,
  },
];

const randomTutorCount = 70 - featuredTutors.length;
const generatedTutors: TutorAccount[] = Array.from({ length: randomTutorCount }, (_, i) => {
  const index = i + featuredTutors.length + 1;
  const username = `tutor${index}`;
  const isInstructor = index <= 20; // Keep first 20 as instructors

  const ratingAvg = Math.round((3.5 + Math.random() * 1.5) * 10) / 10;

  const numSkills = 2 + Math.floor(Math.random() * 3);
  const expertise: string[] = [];
  const availableSkills = [...allSubjects];

  for (let j = 0; j < numSkills; j++) {
    const skillIndex = Math.floor(Math.random() * availableSkills.length);
    expertise.push(availableSkills[skillIndex]);
    availableSkills.splice(skillIndex, 1);
  }

  return {
    userId: `t${index}`,
    username,
    email: `${username}@hcmut.edu.vn`,
    passwordHash: hashPassword('tutor123'),
    createdAt: '2020-01-01T00:00:00',
    role: 'Tutor',
    tutorId: `T${String(index).padStart(3, '0')}`,
    expertise,
    ratingAvg,
    isInstructor,
  };
});

export const mockTutorAccounts: TutorAccount[] = [...featuredTutors, ...generatedTutors];

const featuredManagers: ManagerAccount[] = [
  {
    userId: 'm1',
    username: 'manager.admin',
    email: 'manager.admin@hcmut.edu.vn',
    passwordHash: hashPassword('manager123'),
    createdAt: '2018-01-01T00:00:00',
    role: 'Manager',
    managerId: 'M001',
    department: 'Computer Science',
  },
  {
    userId: 'm2',
    username: 'manager.mentor',
    email: 'manager.mentor@hcmut.edu.vn',
    passwordHash: hashPassword('manager123'),
    createdAt: '2018-01-01T00:00:00',
    role: 'Manager',
    managerId: 'M002',
    department: 'Software Engineering',
  },
];

const randomManagerCount = 5 - featuredManagers.length;
const generatedManagers: ManagerAccount[] = Array.from({ length: randomManagerCount }, (_, i) => {
  const index = i + featuredManagers.length + 1;
  const username = `manager${index}`;

  return {
    userId: `m${index}`,
    username,
    email: `${username}@hcmut.edu.vn`,
    passwordHash: hashPassword('manager123'),
    createdAt: '2019-01-01T00:00:00',
    role: 'Manager',
    managerId: `M${String(index).padStart(3, '0')}`,
    department: departments[Math.floor(Math.random() * departments.length)],
  };
});

export const mockManagerAccounts: ManagerAccount[] = [...featuredManagers, ...generatedManagers];

// Combine all users
export const mockUsers: UserEntity[] = [...mockStudentAccounts, ...mockTutorAccounts, ...mockManagerAccounts];
