import type { Permission, Role, RolePermission, UserRole } from '@/domain/entities/rbac';
import { simulateNetworkLatency } from '../utils/network';

const roles: Role[] = [];
const permissions: Permission[] = [];
const rolePermissions: RolePermission[] = [];
const userRoles: UserRole[] = [];

class MockRbacRepository {
  async listRoles(): Promise<Role[]> {
    await simulateNetworkLatency();
    return [...roles];
  }

  async listPermissions(): Promise<Permission[]> {
    await simulateNetworkLatency();
    return [...permissions];
  }

  async listRolePermissions(roleId: string): Promise<RolePermission[]> {
    await simulateNetworkLatency();
    return rolePermissions.filter((rp) => rp.roleId === roleId);
  }

  async listUserRoles(userId: string): Promise<UserRole[]> {
    await simulateNetworkLatency();
    return userRoles.filter((ur) => ur.userId === userId);
  }
}

export const mockRbacRepository = new MockRbacRepository();




