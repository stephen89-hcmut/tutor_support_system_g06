import type { Document } from '@/domain/entities/document';
import { mockDocuments } from '@/data/mockDocuments';
import { simulateNetworkLatency } from '../utils/network';

class MockDocumentRepository {
  async list(): Promise<Document[]> {
    await simulateNetworkLatency();
    return mockDocuments.map((doc) => ({ ...doc }));
  }

  async findById(documentId: string): Promise<Document | undefined> {
    await simulateNetworkLatency();
    return mockDocuments.find((doc) => doc.id === documentId);
  }
}

export const mockDocumentRepository = new MockDocumentRepository();

