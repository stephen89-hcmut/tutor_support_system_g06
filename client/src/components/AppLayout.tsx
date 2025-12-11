import React, { useEffect, useState, memo } from 'react';
import { useRole } from '@/contexts/RoleContext';
import {
  LayoutDashboard,
  Home,
  Search,
  Calendar,
  TrendingUp,
  BookOpen,
  Users,
  Shield,
  BarChart3,
  MessageSquare,
  LogOut,
  User,
  Database,
  FileText,
  Folder,
  List,
  Activity,
  UserCheck,
  PieChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/domain/entities/profile';
import { profileService } from '@/application/services/profileService';

interface AppLayoutProps {
  currentScreen: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
  children?: React.ReactNode;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuItemsByRole: Record<string, MenuItem[]> = {
  Student: [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'find-tutor', label: 'Meetings', icon: Search },
    { id: 'meetings', label: 'Schedules', icon: Calendar },
    { id: 'my-progress', label: 'Progress', icon: TrendingUp },
    { id: 'library', label: 'Documents', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: User },
  ],
  Tutor: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meetings', label: 'Schedules', icon: Calendar },
    { id: 'students', label: 'My Students', icon: Users },
    { id: 'feedback', label: 'Feedback Analysis', icon: PieChart },
    { id: 'library', label: 'Documents', icon: Folder },
    { id: 'profile', label: 'Profile (CV)', icon: UserCheck },
  ],
  Manager: [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'manage-meetings', label: 'Meeting Management', icon: List },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'permissions', label: 'System Settings', icon: Shield },
    { id: 'library', label: 'Document Control', icon: FileText },
  ],
};

export const AppLayout = memo(function AppLayout({ currentScreen, onNavigate, onLogout, children }: AppLayoutProps) {
  const { role, userId, userName } = useRole();
  const menuItems = role ? menuItemsByRole[role] || [] : [];
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      if (!role || !userId) {
        setUserProfile(null);
        return;
      }
      try {
        // Try to get profile by userId first, fallback to role
        const profile = userId 
          ? (await profileService.getProfileByUserId(userId)) || await profileService.getProfileByRole(role)
          : await profileService.getProfileByRole(role);
        if (!mounted) return;
        setUserProfile(profile);
      } catch (err) {
        if (!mounted) return;
        setUserProfile(null);
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [role, userId]);

  const getRoleColor = () => {
    switch (role) {
      case 'Student':
        return 'bg-blue-500 text-white';
      case 'Tutor':
        return 'bg-green-500 text-white';
      case 'Manager':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getDisplayId = () => {
    if (!userProfile) return userId ? `ID: ${userId}` : 'ID: N/A';
    if (userProfile.studentId) return `ID: ${userProfile.studentId}`;
    if (userProfile.tutorId) return `ID: ${userProfile.tutorId}`;
    if (userProfile.managerId) return `ID: ${userProfile.managerId}`;
    return `ID: ${userProfile.userId}`;
  };

  const getDisplayName = () => {
    return userName || userProfile?.fullName || 'User';
  };

  const getInitials = () => {
    if (userName) {
      return userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 3);
    }
    return userProfile?.initials || 'U';
  };

  return (
    <div className="flex flex-1 bg-background">
      {/* Fixed Sidebar */}
      <aside className="w-64 bg-white border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-primary">HCMUT Tutor System</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-primary text-primary-foreground'
                )}
                onClick={() => onNavigate(item.id)}
              >
                <Icon className="mr-2 h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* User Info and Logout - Always at bottom */}
        <div className="mt-auto">
          {/* User Info Section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg flex-shrink-0">
                {getInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{getDisplayName()}</p>
                {role && (
                  <p className="text-xs text-muted-foreground mt-1">{role}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">{getDisplayId()}</p>
              </div>
            </div>
          </div>
          
          {/* Logout Button */}
          {onLogout && (
            <div className="px-4 pb-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={onLogout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
});

