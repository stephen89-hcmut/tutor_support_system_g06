import type { Topic } from '@/domain/entities/topic';
import { simulateNetworkLatency } from '../utils/network';

const topics: Topic[] = [];

class MockTopicRepository {
  async listByCourse(courseId: string): Promise<Topic[]> {
    await simulateNetworkLatency();
    return topics.filter((topic) => topic.courseId === courseId);
  }

  async create(topic: Topic): Promise<Topic> {
    await simulateNetworkLatency();
    topics.push(topic);
    return topic;
  }

  async findById(topicId: string): Promise<Topic | undefined> {
    await simulateNetworkLatency();
    return topics.find((topic) => topic.topicId === topicId);
  }
}

export const mockTopicRepository = new MockTopicRepository();
