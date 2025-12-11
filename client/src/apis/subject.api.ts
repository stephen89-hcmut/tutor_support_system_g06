import { httpClient } from '@/lib/httpClient';

export type SubjectDto = {
  id: string;
  code: string;
  name: string;
  type: number;
};

export const subjectApi = {
  getAll: async (): Promise<SubjectDto[]> => httpClient.get<SubjectDto[]>('/Subjects'),
};
