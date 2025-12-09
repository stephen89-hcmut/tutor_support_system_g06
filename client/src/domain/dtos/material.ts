import { DocumentType, FileFormat } from '../entities/document';
import { MaterialVisibility } from '../enums';

export interface MaterialFilterDto {
  keywords?: string;
  courseId?: string;
  topicId?: string;
  type?: DocumentType;
}

export interface MaterialMetadataDto {
  title: string;
  description?: string;
  type: DocumentType;
  visibility: MaterialVisibility;
  format: FileFormat;
  courseIds?: string[];
  topicIds?: string[];
}


