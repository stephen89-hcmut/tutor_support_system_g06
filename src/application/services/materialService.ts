import type { Document } from '@/domain/entities/document';
import type { MaterialFilterDto, MaterialMetadataDto } from '@/domain/dtos';
import { mockDocumentRepository } from '@/infrastructure/mockApi/repositories/documentRepository';
import { mockCourseRepository } from '@/infrastructure/mockApi/repositories/courseRepository';
import { mockTopicRepository } from '@/infrastructure/mockApi/repositories/topicRepository';

interface MaterialShareHistory {
  materialId: string;
  fromUserId: string;
  toUserId: string;
  sharedAt: string;
}

const materialShareHistory: MaterialShareHistory[] = [];

class MaterialService {
  async list(): Promise<Document[]> {
    return mockDocumentRepository.list();
  }

  async searchMaterials(query: string, filter: MaterialFilterDto): Promise<Document[]> {
    const allMaterials = await mockDocumentRepository.list();
    const keywords = query?.toLowerCase();
    return allMaterials.filter((material) => {
      const matchesKeyword = keywords
        ? material.title.toLowerCase().includes(keywords) ||
          material.description.toLowerCase().includes(keywords ?? '')
        : true;
      const matchesCourse = filter.courseId ? material.courseIds?.includes(filter.courseId) : true;
      const matchesTopic = filter.topicId ? material.topicIds?.includes(filter.topicId) : true;
      const matchesType = filter.type ? material.type === filter.type : true;
      return matchesKeyword && matchesCourse && matchesTopic && matchesType;
    });
  }

  async getMaterialDetail(materialId: string): Promise<Document | undefined> {
    return mockDocumentRepository.findById(materialId);
  }

  async getById(documentId: string): Promise<Document | undefined> {
    return mockDocumentRepository.findById(documentId);
  }

  async uploadMaterial(file: File, metadata: MaterialMetadataDto, uploaderId: string): Promise<Document> {
    const material: Document = {
      id: `mat-${Date.now()}`,
      title: metadata.title,
      description: metadata.description ?? '',
      type: metadata.type,
      format: metadata.format,
      size: `${Math.round(file.size / 1024)} KB`,
      downloads: 0,
      accessLevel: metadata.visibility === 'PUBLIC' ? 'public' : 'restricted',
      uploadedBy: uploaderId,
      uploadedByName: 'Current User',
      uploadDate: new Date().toISOString(),
      category: metadata.type,
      fileUrl: `local://uploads/${file.name}`,
      visibility: metadata.visibility,
      courseIds: metadata.courseIds ?? [],
      topicIds: metadata.topicIds ?? [],
    };
    return mockDocumentRepository.create(material);
  }

  async shareMaterial(materialId: string, fromUserId: string, toUserId: string): Promise<boolean> {
    const material = await mockDocumentRepository.findById(materialId);
    if (!material) return false;
    materialShareHistory.push({
      materialId,
      fromUserId,
      toUserId,
      sharedAt: new Date().toISOString(),
    });
    return true;
  }

  async linkMaterialToCourse(materialId: string, courseId: string): Promise<boolean> {
    const [material, course] = await Promise.all([
      mockDocumentRepository.findById(materialId),
      mockCourseRepository.findById(courseId),
    ]);
    if (!material || !course) return false;
    const courseIds = new Set(material.courseIds ?? []);
    courseIds.add(courseId);
    await mockDocumentRepository.update(materialId, { courseIds: Array.from(courseIds) });
    return true;
  }

  async linkMaterialToTopic(materialId: string, topicId: string): Promise<boolean> {
    const [material, topic] = await Promise.all([
      mockDocumentRepository.findById(materialId),
      mockTopicRepository.findById(topicId),
    ]);
    if (!material || !topic) return false;
    const topicIds = new Set(material.topicIds ?? []);
    topicIds.add(topicId);
    await mockDocumentRepository.update(materialId, { topicIds: Array.from(topicIds) });
    return true;
  }

  async deleteMaterial(materialId: string, userId: string): Promise<boolean> {
    const material = await mockDocumentRepository.findById(materialId);
    if (!material) return false;
    // Check if user is the owner or manager
    if (material.uploadedBy !== userId) {
      // In real app, check if user is manager
      return false;
    }
    return mockDocumentRepository.delete(materialId);
  }

  async updateMaterial(materialId: string, updates: Partial<Document>, userId: string): Promise<Document | undefined> {
    const material = await mockDocumentRepository.findById(materialId);
    if (!material) return undefined;
    // Check if user is the owner or manager
    if (material.uploadedBy !== userId) {
      // In real app, check if user is manager
      return undefined;
    }
    return mockDocumentRepository.update(materialId, updates);
  }

  async updateAccessLevel(materialId: string, accessLevel: 'public' | 'restricted' | 'private', userId: string): Promise<boolean> {
    const material = await mockDocumentRepository.findById(materialId);
    if (!material) return false;
    // Check if user is the owner or manager
    if (material.uploadedBy !== userId) {
      // In real app, check if user is manager
      return false;
    }
    await mockDocumentRepository.update(materialId, { accessLevel });
    return true;
  }
}

export const materialService = new MaterialService();

