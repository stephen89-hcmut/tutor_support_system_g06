import type { Document } from '@/domain/entities/document';
import { mockStudentAccounts, mockTutorAccounts, mockManagerAccounts } from './mockUsers';

// Helper to get name from username
function getName(username: string, role: 'Student' | 'Tutor' | 'Manager'): string {
  if (role === 'Student') {
    const name = username.replace('sv.', '');
    return name.charAt(0).toUpperCase() + name.slice(1);
  } else if (role === 'Tutor') {
    if (username.startsWith('tutor.')) {
      const name = username.replace('tutor.', '');
      return `Dr. ${name.charAt(0).toUpperCase() + name.slice(1)}`;
    }
    return `Dr. ${username.charAt(0).toUpperCase() + username.slice(1)}`;
  } else {
    if (username.startsWith('manager.')) {
      const name = username.replace('manager.', '');
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return username.charAt(0).toUpperCase() + username.slice(1);
  }
}

// Document templates
const documentTemplates = [
  { type: 'Lecture Notes', categories: ['Computer Science', 'Mathematics', 'Physics'] },
  { type: 'Assignment', categories: ['Computer Science', 'Mathematics', 'Physics'] },
  { type: 'Study Material', categories: ['Computer Science', 'Mathematics', 'Physics', 'Research'] },
  { type: 'Research Paper', categories: ['Research', 'Computer Science'] },
  { type: 'Lab Manual', categories: ['Physics', 'Computer Science'] },
  { type: 'Project Report', categories: ['Computer Science', 'Research'] },
  { type: 'Syllabus', categories: ['Computer Science', 'Mathematics', 'Physics'] },
];

const titles = [
  'Data Structures and Algorithms',
  'Introduction to Programming',
  'Database Systems',
  'Web Development Fundamentals',
  'Machine Learning Basics',
  'Software Engineering Principles',
  'Object-Oriented Design',
  'System Design Patterns',
  'Python Programming',
  'Java Programming',
  'C++ Programming',
  'JavaScript Essentials',
  'React Development',
  'Node.js Backend',
  'Mobile App Development',
  'Computer Networks',
  'Cybersecurity Fundamentals',
  'Artificial Intelligence',
  'Deep Learning',
  'Data Science',
  'Calculus I',
  'Linear Algebra',
  'Discrete Mathematics',
  'Probability and Statistics',
  'Operating Systems',
  'Compiler Design',
  'Computer Graphics',
  'Distributed Systems',
  'Cloud Computing',
  'Big Data Analytics',
];

const descriptions = [
  'Comprehensive guide covering all fundamental concepts and practical examples.',
  'Step-by-step tutorial with exercises and solutions.',
  'Detailed notes from lectures with additional explanations.',
  'Complete reference material for exam preparation.',
  'Hands-on lab exercises with detailed instructions.',
  'Research findings and analysis on current topics.',
  'Project documentation with code examples and diagrams.',
  'Course syllabus with learning objectives and schedule.',
];

// Generate 100 documents
export const mockDocuments: Document[] = [];

// Generate documents from tutors (60 documents)
mockTutorAccounts.slice(0, 30).forEach((tutor, tutorIndex) => {
  const numDocs = 2; // 2 docs per tutor = 60 docs
  for (let i = 0; i < numDocs; i++) {
    const template = documentTemplates[Math.floor(Math.random() * documentTemplates.length)];
    const category = template.categories[Math.floor(Math.random() * template.categories.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    const formats: Array<'PDF' | 'DOCX' | 'ZIP' | 'PPTX' | 'XLSX'> = ['PDF', 'DOCX', 'ZIP', 'PPTX', 'XLSX'];
    const format = formats[Math.floor(Math.random() * formats.length)];
    
    const sizes = ['1.2 MB', '2.4 MB', '3.8 MB', '5.2 MB', '8.7 MB', '12.3 MB'];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    
    // More public documents for better visibility
    // 60% public, 30% restricted, 10% private
    const rand = Math.random();
    const accessLevel: 'public' | 'restricted' | 'private' = rand < 0.6 ? 'public' : rand < 0.9 ? 'restricted' : 'private';
    
    const uploadDate = new Date();
    uploadDate.setDate(uploadDate.getDate() - Math.floor(Math.random() * 90));
    
    mockDocuments.push({
      id: `doc-t${tutorIndex}-${i + 1}`,
      title: `${title} - ${template.type}`,
      description,
      type: template.type as any,
      format,
      size,
      downloads: Math.floor(Math.random() * 300),
      accessLevel,
      uploadedBy: tutor.userId,
      uploadedByName: getName(tutor.username, 'Tutor'),
      uploadDate: uploadDate.toISOString().split('T')[0],
      category,
      fileUrl: `https://example.com/files/${title.toLowerCase().replace(/\s+/g, '-')}.${format.toLowerCase()}`,
    });
  }
});

// Generate documents from students (30 documents)
mockStudentAccounts.slice(0, 15).forEach((student, studentIndex) => {
  const numDocs = 2; // 2 docs per student = 30 docs
  for (let i = 0; i < numDocs; i++) {
    const template = documentTemplates[Math.floor(Math.random() * documentTemplates.length)];
    const category = template.categories[Math.floor(Math.random() * template.categories.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    const formats: Array<'PDF' | 'DOCX' | 'ZIP' | 'PPTX' | 'XLSX'> = ['PDF', 'DOCX', 'ZIP'];
    const format = formats[Math.floor(Math.random() * formats.length)];
    
    const sizes = ['1.2 MB', '2.4 MB', '3.8 MB', '5.2 MB'];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    
    // Students typically upload public documents
    const accessLevel: 'public' | 'restricted' | 'private' = Math.random() > 0.3 ? 'public' : 'restricted';
    
    const uploadDate = new Date();
    uploadDate.setDate(uploadDate.getDate() - Math.floor(Math.random() * 60));
    
    mockDocuments.push({
      id: `doc-s${studentIndex}-${i + 1}`,
      title: `${title} - ${template.type}`,
      description,
      type: template.type as any,
      format,
      size,
      downloads: Math.floor(Math.random() * 150),
      accessLevel,
      uploadedBy: student.userId,
      uploadedByName: getName(student.username, 'Student'),
      uploadDate: uploadDate.toISOString().split('T')[0],
      category,
      fileUrl: `https://example.com/files/${title.toLowerCase().replace(/\s+/g, '-')}.${format.toLowerCase()}`,
    });
  }
});

// Generate documents from managers (10 documents)
mockManagerAccounts.forEach((manager, managerIndex) => {
  const numDocs = 2; // 2 docs per manager = 10 docs
  for (let i = 0; i < numDocs; i++) {
    const template = documentTemplates[Math.floor(Math.random() * documentTemplates.length)];
    const category = template.categories[Math.floor(Math.random() * template.categories.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    const formats: Array<'PDF' | 'DOCX' | 'ZIP' | 'PPTX' | 'XLSX'> = ['PDF', 'DOCX', 'PPTX'];
    const format = formats[Math.floor(Math.random() * formats.length)];
    
    const sizes = ['2.4 MB', '3.8 MB', '5.2 MB', '8.7 MB'];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    
    // Managers can have all access levels
    // More public documents for better visibility
    // 60% public, 30% restricted, 10% private
    const rand = Math.random();
    const accessLevel: 'public' | 'restricted' | 'private' = rand < 0.6 ? 'public' : rand < 0.9 ? 'restricted' : 'private';
    
    const uploadDate = new Date();
    uploadDate.setDate(uploadDate.getDate() - Math.floor(Math.random() * 120));
    
    mockDocuments.push({
      id: `doc-m${managerIndex}-${i + 1}`,
      title: `${title} - ${template.type}`,
      description,
      type: template.type as any,
      format,
      size,
      downloads: Math.floor(Math.random() * 200),
      accessLevel,
      uploadedBy: manager.userId,
      uploadedByName: getName(manager.username, 'Manager'),
      uploadDate: uploadDate.toISOString().split('T')[0],
      category,
      fileUrl: `https://example.com/files/${title.toLowerCase().replace(/\s+/g, '-')}.${format.toLowerCase()}`,
    });
  }
});

// Total: 60 + 30 + 10 = 100 documents
