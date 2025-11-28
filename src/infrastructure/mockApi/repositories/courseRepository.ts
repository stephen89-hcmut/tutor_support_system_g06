import type { Course } from '@/domain/entities/course';
import { simulateNetworkLatency } from '../utils/network';

const courses: Course[] = [];

class MockCourseRepository {
  async list(): Promise<Course[]> {
    await simulateNetworkLatency();
    return [...courses];
  }

  async create(course: Course): Promise<Course> {
    await simulateNetworkLatency();
    courses.push(course);
    return course;
  }

  async findById(courseId: string): Promise<Course | undefined> {
    await simulateNetworkLatency();
    return courses.find((course) => course.courseId === courseId);
  }
}

export const mockCourseRepository = new MockCourseRepository();


