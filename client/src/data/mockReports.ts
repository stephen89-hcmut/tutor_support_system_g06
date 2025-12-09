import type { ReportData, GeneratedReport } from '@/domain/entities/report';

export const availableReports: ReportData[] = [
  {
    id: 'report-1',
    title: 'User Activity Report',
    description: 'Track user engagement and activity patterns',
    type: 'User Activity Report',
    icon: '👥',
  },
  {
    id: 'report-2',
    title: 'Meeting Statistics',
    description: 'Analysis of meeting completion and attendance',
    type: 'Meeting Statistics',
    icon: '📊',
  },
  {
    id: 'report-3',
    title: 'Student Progress Report',
    description: 'Student academic performance and progress tracking',
    type: 'Student Progress Report',
    icon: '📈',
  },
  {
    id: 'report-4',
    title: 'Tutor Performance',
    description: 'Tutor effectiveness and student satisfaction',
    type: 'Tutor Performance',
    icon: '⭐',
  },
  {
    id: 'report-5',
    title: 'Document Access Log',
    description: 'Document library usage and download statistics',
    type: 'Document Access Log',
    icon: '📁',
  },
  {
    id: 'report-6',
    title: 'System Usage Report',
    description: 'Overall system performance and usage metrics',
    type: 'System Usage Report',
    icon: '⚙️',
  },
];

export const mockGeneratedReports: GeneratedReport[] = [
  {
    id: 'gen-1',
    title: 'User Activity Report',
    type: 'User Activity Report',
    generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(),
    dateRange: 'Last 30 Days',
    recordCount: 6855,
    summary: {
      totalUsers: 1245,
      activeSessions: 537,
      avgEngagement: 75.0,
    },
  },
  {
    id: 'gen-2',
    title: 'Meeting Statistics',
    type: 'Meeting Statistics',
    generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(),
    dateRange: 'Last 30 Days',
    recordCount: 450,
    summary: {
      totalUsers: 1245,
      activeSessions: 450,
      completionRate: 88.5,
    },
  },
  {
    id: 'gen-3',
    title: 'Student Progress Report',
    type: 'Student Progress Report',
    generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString(),
    dateRange: 'Last 30 Days',
    recordCount: 1200,
    summary: {
      totalUsers: 1000,
      completionRate: 82.3,
      avgEngagement: 78.5,
    },
  },
  {
    id: 'gen-4',
    title: 'Tutor Performance',
    type: 'Tutor Performance',
    generatedAt: new Date(Date.now() - 10 * 24 * 60 * 60000).toISOString(),
    dateRange: 'Last 30 Days',
    recordCount: 125,
    summary: {
      totalUsers: 125,
      avgEngagement: 92.0,
      completionRate: 95.2,
    },
  },
  {
    id: 'gen-5',
    title: 'Document Access Log',
    type: 'Document Access Log',
    generatedAt: new Date(Date.now() - 15 * 24 * 60 * 60000).toISOString(),
    dateRange: 'Last 30 Days',
    recordCount: 2340,
    summary: {
      activeSessions: 856,
      avgEngagement: 68.5,
    },
  },
];
