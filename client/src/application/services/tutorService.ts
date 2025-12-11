import type { TutorProfile } from '@/domain/entities/tutor';
import { tutorApi } from '@/apis/tutor.api';

type TutorDto = {
  id: string;
  userId: string;
  fullName: string;
  tutorCode: string;
  averageRating: number;
  totalReviews: number;
  expertise?: string;
  bio?: string;
};

const toTutorProfile = (dto: TutorDto): TutorProfile => {
  const skills = (dto.expertise ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const name = dto.fullName;
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return {
    id: dto.userId,
    name,
    initials,
    department: '',
    specialization: dto.tutorCode,
    rating: dto.averageRating,
    reviewCount: dto.totalReviews,
    sessionCount: 0,
    skills,
    meetingMode: 'Both',
    gender: 'Other',
    languages: ['Vietnamese'],
    bio: dto.bio ?? '',
    availability: [],
  };
};

class TutorService {
  async list(search?: string, subject?: string): Promise<TutorProfile[]> {
    const tutors = await tutorApi.getAllTutors(search, subject);
    return tutors.map(toTutorProfile);
  }

  async getById(tutorId: string): Promise<TutorProfile | undefined> {
    const tutors = await tutorApi.getAllTutors();
    const dto = tutors.find((t) => t.userId === tutorId || t.id === tutorId);
    return dto ? toTutorProfile(dto) : undefined;
  }
}

export const tutorService = new TutorService();




