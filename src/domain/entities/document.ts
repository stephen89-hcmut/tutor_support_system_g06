export type AccessLevel = 'public' | 'restricted' | 'private';
export type DocumentType =
  | 'Lecture Notes'
  | 'Assignment'
  | 'Study Material'
  | 'Research Paper'
  | 'Lab Manual'
  | 'Project Report'
  | 'Syllabus';
export type FileFormat = 'PDF' | 'DOCX' | 'ZIP' | 'PPTX' | 'XLSX';

export interface Document {
  id: string;
  title: string;
  description: string;
  type: DocumentType;
  format: FileFormat;
  size: string;
  downloads: number;
  accessLevel: AccessLevel;
  uploadedBy: string;
  uploadedByName: string;
  uploadDate: string;
  category?: string;
}

