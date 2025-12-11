import type { Subject } from '@/domain/entities/subject';
import { subjectApi } from '@/apis/subject.api';

const toSubject = (dto: { id: string; code: string; name: string; type: number }): Subject => ({
  id: dto.id,
  code: dto.code,
  name: dto.name,
  type: dto.type,
});

class SubjectService {
  async list(): Promise<Subject[]> {
    const data = await subjectApi.getAll();
    return data.map(toSubject);
  }
}

export const subjectService = new SubjectService();
