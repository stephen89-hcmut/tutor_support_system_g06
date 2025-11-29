import type { Topic } from '@/domain/entities/topic';
import type { Document } from '@/domain/entities/document';
import { mockTopicRepository } from '@/infrastructure/mockApi/repositories/topicRepository';
import { mockDocumentRepository } from '@/infrastructure/mockApi/repositories/documentRepository';

class TopicService {
  async createTopic(topic: Topic): Promise<string> {
    await mockTopicRepository.create(topic);
    return topic.topicId;
  }

  async getTopicMaterials(topicId: string): Promise<Document[]> {
    const materials = await mockDocumentRepository.list();
    return materials.filter((material) => material.topicIds?.includes(topicId));
  }
}

export const topicService = new TopicService();




