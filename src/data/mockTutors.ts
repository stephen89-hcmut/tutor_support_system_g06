import type { TutorProfile } from '@/domain/entities/tutor';
import { mockTutorAccounts } from './mockUsers';

// Helper to get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 4);
}

// Generate availability slots
function generateAvailability(): Array<{ date: string; time: string }> {
  const slots: Array<{ date: string; time: string }> = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1); // Start from tomorrow
  
  // Generate 5-10 available slots over next 7 days
  const numSlots = 5 + Math.floor(Math.random() * 6);
  const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  
  for (let i = 0; i < numSlots; i++) {
    const daysOffset = Math.floor(Math.random() * 7);
    const date = new Date(startDate);
    date.setDate(date.getDate() + daysOffset);
    const time = times[Math.floor(Math.random() * times.length)];
    
    slots.push({
      date: date.toISOString().split('T')[0],
      time,
    });
  }
  
  return slots;
}

// Generate tutor profiles from tutor accounts
export const mockTutors: TutorProfile[] = mockTutorAccounts.map((tutor, index) => {
  const name = `Dr. ${tutor.username.charAt(0).toUpperCase() + tutor.username.slice(1)}`;
  const departments = ['Computer Science', 'Software Engineering', 'Information Systems', 'Mathematics', 'Data Science'];
  const specializations = ['Computer Science', 'Software Engineering', 'Information Systems', 'Mathematics', 'Data Science', 'Cybersecurity'];
  
  // Generate review count and session count based on rating
  const reviewCount = Math.floor(50 + (tutor.ratingAvg - 3.5) * 100);
  const sessionCount = Math.floor(reviewCount * 1.5);
  
  // Meeting mode
  const meetingModes: Array<'Online' | 'In-Person' | 'Both'> = ['Online', 'In-Person', 'Both'];
  const meetingMode = meetingModes[Math.floor(Math.random() * meetingModes.length)];
  
  // Gender
  const genders: Array<'Male' | 'Female' | 'Other'> = ['Male', 'Female', 'Other'];
  const gender = genders[Math.floor(Math.random() * genders.length)];
  
  // Languages
  const languageOptions: Array<'English' | 'Vietnamese' | 'Both'>[] = [
    ['English'],
    ['Vietnamese'],
    ['English', 'Vietnamese'],
    ['Both']
  ];
  const languages = languageOptions[Math.floor(Math.random() * languageOptions.length)] as any;
  
  // Bio
  const bios = [
    `Experienced ${tutor.isInstructor ? 'instructor' : 'tutor'} specializing in ${tutor.expertise.join(', ')}.`,
    `Passionate educator with expertise in ${tutor.expertise[0]} and ${tutor.expertise[1]}.`,
    `Dedicated ${tutor.isInstructor ? 'professor' : 'tutor'} helping students excel in ${tutor.expertise.join(' and ')}.`,
    `Professional ${tutor.isInstructor ? 'instructor' : 'tutor'} with strong background in ${tutor.expertise[0]}.`,
  ];
  const bio = bios[Math.floor(Math.random() * bios.length)];
  
  return {
    id: tutor.userId,
    name,
    initials: getInitials(name),
    department: departments[Math.floor(Math.random() * departments.length)],
    specialization: specializations[Math.floor(Math.random() * specializations.length)],
    rating: tutor.ratingAvg,
    reviewCount,
    sessionCount,
    skills: tutor.expertise,
    meetingMode,
    gender,
    languages,
    bio,
    availability: generateAvailability(),
  };
});
