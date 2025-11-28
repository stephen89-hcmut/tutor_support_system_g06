export interface Role {
  roleId: string;
  name: string;
  description?: string;
}

export interface Permission {
  permissionId: string;
  name: string;
  description?: string;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
}

export interface UserRole {
  userId: string;
  roleId: string;
}


