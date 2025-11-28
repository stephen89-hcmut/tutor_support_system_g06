import { UserProfile } from '@/contexts/RoleContext';

// Mock sync with external HCMUT DataCore API.
export async function syncProfileWithHCMUT(userId: string, role: string): Promise<UserProfile> {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 800));

  // In a real implementation, call HCMUT_DATACORE API here and map fields.
  // Return an updated user object — here we just append a marker for demo.
  const updated: UserProfile = {
    id: userId,
    name: 'Nguyen Van A',
    initials: 'NVA',
    email: 'nguyenvana@hcmut.edu.vn',
    studentId: 'STU001',
  };

  // Simulate occasional failure (commented out by default)
  // if (Math.random() < 0.1) throw new Error('HCMUT API error');

  return updated;
}
