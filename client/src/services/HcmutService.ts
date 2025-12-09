import type { UserProfile } from '@/domain/entities/profile';

// Mock sync with external HCMUT DataCore API.
export async function syncProfileWithHCMUT(userId: string): Promise<UserProfile> {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 800));

  // In a real implementation, call HCMUT_DATACORE API here and map fields.
  // Return an updated user object — here we just append a marker for demo.
  const updated: UserProfile = {
    userId,
    username: 'nguyenvana',
    fullName: 'Nguyen Van A',
    initials: 'NVA',
    email: 'nguyenvana@hcmut.edu.vn',
    phone: '+84 901 234 567',
    studentId: 'STU001',
    role: 'Student',
  };

  // Simulate occasional failure (commented out by default)
  // if (Math.random() < 0.1) throw new Error('HCMUT API error');

  return updated;
}
