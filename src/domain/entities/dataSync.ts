export type SyncStatus = 'Success' | 'Pending' | 'Failed' | 'In Progress';
export type SyncModule = 'User Management' | 'Meetings' | 'Progress' | 'Documents' | 'AI Feedback' | 'All Modules';

export interface SyncRecord {
  id: string;
  module: SyncModule;
  status: SyncStatus;
  recordsSync: number;
  lastSync: string;
  duration: string;
  message: string;
  timestamp: string;
  dataIntegrity: number; // 0-100 percentage
}

export interface SyncService {
  id: string;
  name: string;
  status: 'Connected' | 'Disconnected';
  lastCheck: string;
  endpoint: string;
}
