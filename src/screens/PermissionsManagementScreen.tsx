import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, BookOpen, Users } from 'lucide-react';
import { mockRolePermissions } from '@/data/mockRolePermissions';
import type { RolePermissions, PermissionCategory } from '@/domain/entities/permission';
import { useToast } from '@/components/ui/use-toast';

interface PermissionsManagementScreenProps {
  onBack: () => void;
}

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Student: BookOpen,
  Tutor: Users,
};

const categoryColors: Record<PermissionCategory, string> = {
  'Authentication': 'bg-blue-50',
  'Profile': 'bg-purple-50',
  'Meeting': 'bg-green-50',
  'Document': 'bg-yellow-50',
  'Progress': 'bg-pink-50',
  'Users & Permissions': 'bg-orange-50',
  'Analytics': 'bg-indigo-50',
  'AI Features': 'bg-cyan-50',
};

export function PermissionsManagementScreen({ onBack }: PermissionsManagementScreenProps) {
  const [selectedRole, setSelectedRole] = useState<RolePermissions | null>(mockRolePermissions[0]);
  const [editingRole, setEditingRole] = useState<RolePermissions | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  const permissionsByCategory = useMemo(() => {
    if (!selectedRole) return {};
    return selectedRole.permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {} as Record<PermissionCategory, typeof selectedRole.permissions>);
  }, [selectedRole]);

  const handleEditRole = (role: RolePermissions) => {
    if (role.roleName === 'Manager') {
      toast({
        title: 'Not Allowed',
        description: 'Manager role permissions cannot be edited.',
        variant: 'destructive',
      });
      return;
    }
    setEditingRole({ ...role, permissions: role.permissions.map(p => ({ ...p })) });
    setShowEditDialog(true);
  };

  const handlePermissionToggle = (permissionId: string) => {
    if (!editingRole) return;
    setEditingRole(prev => ({
      ...prev!,
      permissions: prev!.permissions.map(p =>
        p.id === permissionId ? { ...p, enabled: !p.enabled } : p
      ),
    }));
  };

  const handleSaveChanges = () => {
    if (!editingRole) return;
    setSelectedRole(editingRole);
    setShowEditDialog(false);
    toast({
      title: 'Success',
      description: `Permissions for ${editingRole.roleName} have been updated successfully.`,
    });
  };

  const getRoleIcon = (roleName: string) => {
    const Icon = roleIcons[roleName as keyof typeof roleIcons] || Users;
    return <Icon className="h-6 w-6" />;
  };

  const getEnabledCount = (role: RolePermissions) => {
    return role.permissions.filter(p => p.enabled).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Role & Permission Management</h1>
          </div>
          <p className="text-muted-foreground">Edit, add or remove permissions for each role in the system</p>
        </div>
      </div>

      {/* Warning Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="text-blue-600 mt-0.5">ℹ️</div>
            <div>
              <p className="font-medium text-blue-900">Permission changes will affect all users with that role.</p>
              <p className="text-sm text-blue-700">All changes are logged for auditing purposes.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Role Cards */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="font-semibold text-lg">Roles</h2>
          {mockRolePermissions.filter(role => role.roleName !== 'Manager').map(role => (
            <Card
              key={role.roleId}
              className={`cursor-pointer transition-all ${
                selectedRole?.roleId === role.roleId
                  ? 'ring-2 ring-primary border-primary'
                  : 'hover:border-primary'
              }`}
              onClick={() => setSelectedRole(role)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {getRoleIcon(role.roleName)}
                    </div>
                    <div>
                      <p className="font-semibold">{role.roleName}</p>
                      <p className="text-xs text-muted-foreground">
                        {getEnabledCount(role)}/{role.totalPermissions} enabled
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Permissions Details */}
        <div className="lg:col-span-3 space-y-6">
          {selectedRole && (
            <>
              {/* Role Header */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-xl">{selectedRole.roleName}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedRole.roleName} - {getEnabledCount(selectedRole)} of {selectedRole.totalPermissions} permissions enabled
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedRole.roleName === 'Manager' && (
                      <span className="text-xs text-muted-foreground italic">Manager role cannot be edited</span>
                    )}
                    <Button 
                      onClick={() => handleEditRole(selectedRole)}
                      disabled={selectedRole.roleName === 'Manager'}
                    >
                      Edit Permissions
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Permissions by Category */}
              {Object.entries(permissionsByCategory).map(([category, perms]) => (
                <Card key={category} className={categoryColors[category as PermissionCategory]}>
                  <CardHeader>
                    <CardTitle className="text-base">{category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(perms as typeof selectedRole.permissions).map(perm => (
                      <div key={perm.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-white/60">
                        <div className="flex-1">
                          <p className="font-medium">{perm.name}</p>
                          <p className="text-sm text-muted-foreground">{perm.description}</p>
                        </div>
                        <Badge variant={perm.enabled ? 'default' : 'secondary'}>
                          {perm.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Edit Permissions Dialog */}
      {editingRole && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Permissions - {editingRole.roleName}</DialogTitle>
              <DialogDescription>
                Select the permissions you want to assign to this role. Changes will apply to all users with this role.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {Object.entries(
                editingRole.permissions.reduce((acc, perm) => {
                  if (!acc[perm.category]) {
                    acc[perm.category] = [];
                  }
                  acc[perm.category].push(perm);
                  return acc;
                }, {} as Record<PermissionCategory, typeof editingRole.permissions>)
              ).map(([category, perms]) => (
                <div key={category}>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <span className="text-lg">✓</span>
                    {category}
                  </h4>
                  <div className="space-y-3 pl-6">
                    {(perms as typeof editingRole.permissions).map(perm => (
                      <div key={perm.id} className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <Label className="font-medium cursor-pointer">{perm.name}</Label>
                          <p className="text-xs text-muted-foreground">{perm.description}</p>
                        </div>
                        <Switch
                          checked={perm.enabled}
                          onCheckedChange={() => handlePermissionToggle(perm.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveChanges}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
