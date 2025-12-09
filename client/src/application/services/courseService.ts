import type { Course } from '@/domain/entities/course';
import type { Document } from '@/domain/entities/document';
import { mockCourseRepository } from '@/infrastructure/repositories/courseRepository';
import { mockDocumentRepository } from '@/infrastructure/repositories/documentRepository';
import { mockCourses } from '@/data/mockCourses';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class CourseService {
  async createCourse(course: Course): Promise<string> {
    await mockCourseRepository.create(course);
    return course.courseId;
  }

  async getCourseMaterials(courseId: string): Promise<Document[]> {
    const materials = await mockDocumentRepository.list();
    return materials.filter((material) => material.courseIds?.includes(courseId));
  }

  async getAll(): Promise<Course[]> {
    await delay(300);
    return mockCourses;
  }

  async getByDepartment(department: string): Promise<Course[]> {
    await delay(300);
    return mockCourses.filter(course => course.department === department);
  }

  async getById(courseId: string): Promise<Course | undefined> {
    await delay(200);
    return mockCourses.find(course => course.courseId === courseId);
  }

  async getTutorsForCourse(courseId: string): Promise<string[]> {
    await delay(200);
    const course = mockCourses.find(c => c.courseId === courseId);
    return course?.tutorIds || [];
  }

  async getCoursesForTutor(tutorId: string): Promise<Course[]> {
    await delay(300);
    return mockCourses.filter(course => course.tutorIds?.includes(tutorId));
  }

  async searchCourses(query: string): Promise<Course[]> {
    await delay(300);
    const lowerQuery = query.toLowerCase();
    return mockCourses.filter(
      course =>
        course.courseName.toLowerCase().includes(lowerQuery) ||
        course.courseCode.toLowerCase().includes(lowerQuery) ||
        course.description?.toLowerCase().includes(lowerQuery)
    );
  }
}

export const courseService = new CourseService();





