export type ReportType = 
  | 'User Activity Report' 
  | 'Meeting Statistics' 
  | 'Student Progress Report' 
  | 'Tutor Performance' 
  | 'Document Access Log' 
  | 'System Usage Report';

export interface ReportData {
  id: string;
  title: string;
  description: string;
  type: ReportType;
  icon: string;
  generatedAt?: string;
  data?: unknown;
}

export interface GeneratedReport {
  id: string;
  title: string;
  type: ReportType;
  generatedAt: string;
  dateRange: string;
  recordCount: number;
  summary: {
    totalUsers?: number;
    activeSessions?: number;
    avgEngagement?: number;
    completionRate?: number;
  };
}
