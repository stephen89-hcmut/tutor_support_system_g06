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

  async create(document: Document): Promise<Document> {
    await simulateNetworkLatency();
    mockDocuments.push(document);
    return document;
  }

  async update(documentId: string, update: Partial<Document>): Promise<Document | undefined> {
    await simulateNetworkLatency();
    const index = mockDocuments.findIndex((doc) => doc.id === documentId);
    if (index === -1) return undefined;
    mockDocuments[index] = { ...mockDocuments[index], ...update };
    return mockDocuments[index];
  }
}

export const mockDocumentRepository = new MockDocumentRepository();

