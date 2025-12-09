export type PermissionCategory = 'Authentication' | 'Profile' | 'Meeting' | 'Document' | 'Progress' | 'Users & Permissions' | 'Analytics' | 'AI Features';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: PermissionCategory;
  enabled: boolean;
}

export interface RolePermissions {
  roleId: string;
  roleName: 'Student' | 'Tutor' | 'Manager';
  permissions: Permission[];
  totalPermissions: number;
}
