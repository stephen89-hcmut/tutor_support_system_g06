import { useState } from 'react';
import { AppLayout } from './components/AppLayout';
import { useRole } from './contexts/RoleContext';

function App() {
  const { role } = useRole();
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');

  const handleNavigate = (page: string) => {
    // Normalize page names to handle different variations
    const normalizedPage = page.toLowerCase().trim();
    
    // Handle explicit cases for 'students' and 'feedback' to avoid navigation bugs
    if (normalizedPage === 'students' || normalizedPage === 'my-students') {
      setCurrentScreen('students');
      return;
    }
    
    if (normalizedPage === 'feedback') {
      setCurrentScreen('feedback');
      return;
    }
    
    // Handle other common page mappings
    const pageMap: Record<string, string> = {
      'dashboard': 'dashboard',
      'meetings': 'meetings',
      'find-tutors': 'find-tutors',
      'findtutors': 'find-tutors',
      'my-progress': 'my-progress',
      'myprogress': 'my-progress',
      'library': 'library',
      'settings': 'settings',
      'users': 'users',
      'permissions': 'permissions',
      'analytics': 'analytics',
    };
    
    // Use mapped page or fallback to normalized page
    const mappedPage = pageMap[normalizedPage] || normalizedPage;
    setCurrentScreen(mappedPage);
  };

  const renderScreenContent = () => {
    const screenMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'meetings': 'Meetings',
      'find-tutors': 'Find Tutors',
      'my-progress': 'My Progress',
      'library': 'Library',
      'settings': 'Settings',
      'students': 'My Students',
      'feedback': 'Feedback',
      'users': 'Users',
      'permissions': 'Permissions',
      'analytics': 'Analytics',
    };

    const screenTitle = screenMap[currentScreen] || currentScreen;

    return (
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-4">{screenTitle}</h2>
        <p className="text-muted-foreground">
          Current role: <span className="font-semibold text-primary">{role}</span>
        </p>
        <p className="text-muted-foreground mt-2">
          Current screen: <span className="font-semibold">{currentScreen}</span>
        </p>
      </div>
    );
  };

  return (
    <AppLayout currentScreen={currentScreen} onNavigate={handleNavigate}>
      {renderScreenContent()}
    </AppLayout>
  );
}

export default App;

