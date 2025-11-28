import React from 'react';
import { useRole } from '@/contexts/RoleContext';
import { 
  LayoutDashboard, 
  Video, 
  Search, 
  TrendingUp, 
  BookOpen, 
  Settings,
  Users,
  Shield,
  BarChart3,
  MessageSquare,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meetings', label: 'Meetings', icon: Video },
    { id: 'find-tutors', label: 'Find Tutors', icon: Search },
    { id: 'my-progress', label: 'My Progress', icon: TrendingUp },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ],
  Tutor: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meetings', label: 'Meetings', icon: Video },
    { id: 'students', label: 'My Students', icon: Users },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ],
  Manager: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meetings', label: 'Meetings', icon: Video },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ],
};

export function AppLayout({ currentScreen, onNavigate, onLogout, children }: AppLayoutProps) {
  const { role } = useRole();
  const menuItems = menuItemsByRole[role] || [];

  return (
    <div className="flex flex-1 bg-background">
      {/* Fixed Sidebar */}
      <aside className="w-64 bg-white border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-primary">HCMUT Tutor System</h1>
          <p className="text-sm text-muted-foreground mt-1">{role}</p>
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

        {/* Logout Button */}
        {onLogout && (
          <div className="p-4 border-t border-border">
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
      </aside>

      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

