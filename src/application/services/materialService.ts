import type { Document } from '@/domain/entities/document';
import { mockDocumentRepository } from '@/infrastructure/mockApi/repositories/documentRepository';

class MaterialService {
  async list(): Promise<Document[]> {
    return mockDocumentRepository.list();
  }

  async getById(documentId: string): Promise<Document | undefined> {
    return mockDocumentRepository.findById(documentId);
  }
}

export const materialService = new MaterialService();

