import type { Course } from '@/domain/entities/course';
import type { Document } from '@/domain/entities/document';
import { mockCourseRepository } from '@/infrastructure/mockApi/repositories/courseRepository';
import { mockDocumentRepository } from '@/infrastructure/mockApi/repositories/documentRepository';

class CourseService {
  async createCourse(course: Course): Promise<string> {
    await mockCourseRepository.create(course);
    return course.courseId;
  }

  async getCourseMaterials(courseId: string): Promise<Document[]> {
    const materials = await mockDocumentRepository.list();
    return materials.filter((material) => material.courseIds?.includes(courseId));
  }
}

export const courseService = new CourseService();



