import { useState, useEffect } from 'react';
import { AppLayout } from './components/AppLayout';
import { useRole } from './contexts/RoleContext';
import { LoginPage } from './pages/LoginPage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { StudentManagementPage } from './pages/StudentManagementPage';
import { StudentDetailPage } from './pages/StudentDetailPageNew';
import { StudentMeetingPage } from './pages/StudentMeetingPage';
import { TutorMeetingPage } from './pages/TutorMeetingPage';
import { ManagerMeetingPage } from './pages/ManagerMeetingPage';
import { DocumentLibraryPage } from './pages/DocumentLibraryPage';
import { TutorProfilePage } from './pages/TutorProfilePage';
import { ProfilePage } from './pages/ProfilePage';
import { PermissionsManagementPage } from './pages/PermissionsManagementPage';
import { DataSyncPage } from './pages/DataSyncPage';
import { ReportsPage } from './pages/ReportsPage';
import { AIFeedbackAnalysisPage } from './pages/AIFeedbackAnalysisPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { StudentProgressPage } from './pages/StudentProgressPage';
import { RecordProgressPage } from './pages/RecordProgressPage';
import { RecordProgressPageNew } from './pages/RecordProgressPageNew';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { StudentAnalyticsPage } from './pages/StudentAnalyticsPage';
import { TutorStudentsPage } from './pages/TutorStudentsPage';
import { meetingService } from '@/application/services/meetingService';
import { useToast } from './components/ui/use-toast';
import { authService } from '@/application/services/authService';
import type { AuthSession } from '@/types/auth';

type StoredRole = 'Student' | 'Tutor' | 'Manager' | 'Management';

const normalizeStoredRole = (role: StoredRole | string | undefined): 'Student' | 'Tutor' | 'Manager' | null => {
  if (role === 'Student' || role === 'Tutor' || role === 'Manager') {
    return role;
  }
  if (role === 'Management') {
    return 'Manager';
  }
  return null;
};

function App() {
  const { role, setRole, setUserId, setUserName, setAccessToken } = useRole();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const [previousScreen, setPreviousScreen] = useState<string>('students');
  const [showAIFeedbackAnalysis, setShowAIFeedbackAnalysis] = useState(false);
  const [showRecordProgress, setShowRecordProgress] = useState(false);
  const [recordProgressStudentId, setRecordProgressStudentId] = useState<string | null>(null);
  const { toast } = useToast();

  // Check for existing authentication on mount
  useEffect(() => {
    const session = authService.getSession();
    if (session) {
      const normalizedRole = normalizeStoredRole(session.role);
      if (!normalizedRole) {
        return;
      }
      setRole(normalizedRole);
      setUserId(session.userId);
      setUserName(session.fullName);
      setAccessToken(session.accessToken);
      setIsAuthenticated(true);
    }
  }, [setRole, setUserId, setUserName, setAccessToken]);

  const handleLogin = (session: AuthSession) => {
    const normalizedRole = normalizeStoredRole(session.role);
    setRole(normalizedRole);
    setUserId(session.userId);
    setUserName(session.fullName);
    setAccessToken(session.accessToken);
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setRole(null);
    setUserId(null);
    setUserName(null);
    setAccessToken(null);
    setIsAuthenticated(false);
    setCurrentScreen('dashboard');
    toast({
      title: 'Đã đăng xuất',
      description: 'Bạn đã đăng xuất thành công.',
    });
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

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
      'find-tutor': 'find-tutor',
      'findtutor': 'find-tutor',
      'my-progress': 'my-progress',
      'myprogress': 'my-progress',
      'library': 'library',
      'settings': 'settings',
      'users': 'users',
      'permissions': 'permissions',
      'analytics': 'analytics',
      'book-meeting': 'find-tutor',
      'bookmeeting': 'find-tutor',
    };
    
    // Use mapped page or fallback to normalized page
    const mappedPage = pageMap[normalizedPage] || normalizedPage;
    setCurrentScreen(mappedPage);
  };

  const handleViewStudent = (studentId: string) => {
    setCurrentStudentId(studentId);
    setPreviousScreen(currentScreen);
    setCurrentScreen('studentDetail');
  };

  const handleBack = () => {
    setCurrentScreen(previousScreen);
    setCurrentStudentId(null);
  };

  const handleRecordProgress = (studentId: string) => {
    console.log('handleRecordProgress called with studentId:', studentId);
    console.log('Current screen:', currentScreen);
    setRecordProgressStudentId(studentId);
    setPreviousScreen(currentScreen);
    setShowRecordProgress(true);
    console.log('showRecordProgress set to true');
  };

  const handleRecordProgressSave = () => {
    setShowRecordProgress(false);
    setRecordProgressStudentId(null);
    // Return to previous screen
    setCurrentScreen(previousScreen);
  };

  const handleViewProgress = (studentId: string) => {
    // For now, just show an alert. In a real app, this would navigate to progress view
    console.log('View progress for student:', studentId);
    alert('View Progress functionality - would navigate to progress view screen');
  };

  const handleViewFeedback = (studentId: string) => {
    // Navigate to student detail and show feedback tab
    setCurrentStudentId(studentId);
    setPreviousScreen(currentScreen);
    setCurrentScreen('studentDetail');
    // Note: In a real app, you might want to pass a prop to open the feedback tab
  };

  const handleViewAllFeedback = (studentId: string) => {
    // Navigate to feedback screen or show all feedback
    console.log('View all feedback for student:', studentId);
    // For now, we're already on the detail screen, so this could scroll to feedback tab
  };

  const handleExport = (studentId: string) => {
    console.log('Export data for student:', studentId);
    alert('Export functionality - would download student data');
  };

  const handleCancelMeeting = async (meetingId: string, cancelledBy: string, reason: string) => {
    await meetingService.cancel(meetingId, cancelledBy as any, reason);
    console.log('Meeting cancelled:', meetingId, cancelledBy, reason);
  };

  const renderScreenContent = () => {
    // Handle record progress screen - must check FIRST before other screens
    if (showRecordProgress && recordProgressStudentId) {
      console.log('Rendering RecordProgressScreen for student:', recordProgressStudentId);
      return (
        <RecordProgressPageNew
          studentId={recordProgressStudentId}
          onBack={() => {
            setShowRecordProgress(false);
            setRecordProgressStudentId(null);
            setCurrentScreen(previousScreen);
          }}
        />
      );
    }

    // Handle student detail screen
    if (currentScreen === 'studentDetail' && currentStudentId) {
      return (
        <StudentDetailPage
          studentId={currentStudentId}
          onBack={handleBack}
          onRecordProgress={handleRecordProgress}
        />
      );
    }

    // Handle students management screen (for manager/tutor)
    if (currentScreen === 'students') {
      // For tutor: show their students with record progress capability
      if (role === 'Tutor') {
        return <TutorStudentsPage onViewStudent={handleViewStudent} />;
      }
      // For manager: show all students management
      return (
        <StudentManagementPage
          onViewStudent={handleViewStudent}
          onViewProgress={handleViewProgress}
          onViewFeedback={handleViewFeedback}
          onRecordProgress={handleRecordProgress}
        />
      );
    }

    // Handle meetings screen
    if (currentScreen === 'meetings') {
      if (role === 'Student') {
        return (
          <StudentMeetingPage
            onCancel={handleCancelMeeting}
            onBookNewMeeting={() => setCurrentScreen('book-meeting')}
          />
        );
      }
      if (role === 'Tutor') {
        return (
          <TutorMeetingPage
            onCancel={handleCancelMeeting}
          />
        );
      }
      // Manager fallback to dashboard
      setCurrentScreen('dashboard');
      return <DashboardPage onNavigate={handleNavigate} />;
    }

    // Handle library screen
    if (currentScreen === 'library') {
      return <DocumentLibraryPage />;
    }

    // Handle book meeting screen (Student only) - use existing BookMeetingPage
    if (currentScreen === 'find-tutor' || currentScreen === 'book-meeting') {
      if (role !== 'Student') {
        return (
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Access Denied</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Only students can book meetings with tutors.</p>
                <Button onClick={handleBack}>Go Back</Button>
              </CardContent>
            </Card>
          </div>
        );
      }
      // Use BookMeetingPage instead of removed MeetingPage
      return (
        <div className="p-4">
          <Typography variant="h5" gutterBottom>Find Tutor & Book Meeting</Typography>
          <Typography variant="body2" color="text.secondary">
            This feature is under development. Please check back later.
          </Typography>
          <Button onClick={() => setCurrentScreen('meetings')} sx={{ mt: 2 }}>
            Back to Meetings
          </Button>
        </div>
      );
    }

    // Handle tutor profile screen
    if (currentScreen === 'tutorProfile' && currentStudentId) {
      return (
        <TutorProfilePage
          tutorId={currentStudentId}
          onBack={() => {
            setCurrentScreen(previousScreen);
            setCurrentStudentId(null);
          }}
        />
      );
    }

    // Handle AI Feedback Analysis screen
    if (showAIFeedbackAnalysis) {
      return (
        <AIFeedbackAnalysisPage
          onBack={() => setShowAIFeedbackAnalysis(false)}
        />
      );
    }

    // Handle feedback screen
    if (currentScreen === 'feedback') {
      return (
        <FeedbackPage
          onAIAnalysis={() => setShowAIFeedbackAnalysis(true)}
        />
      );
    }

    // Handle my progress screen
    if (currentScreen === 'my-progress') {
      return <StudentProgressPage />;
    }

    // Handle settings screen (not available for Manager)
    if (currentScreen === 'settings') {
      if (role === 'Manager') {
        setCurrentScreen('dashboard');
        return <DashboardPage onNavigate={handleNavigate} />;
      }
      return <SettingsPage />;
    }

    // Handle profile screen (not available for Manager)
    if (currentScreen === 'profile') {
      if (role === 'Manager') {
        setCurrentScreen('dashboard');
        return <DashboardPage onNavigate={handleNavigate} />;
      }
      return (
        <ProfilePage
          onBack={() => setCurrentScreen('dashboard')}
        />
      );
    }

    // Handle dashboard screen
    if (currentScreen === 'dashboard') {
      return <DashboardPage onNavigate={handleNavigate} />;
    }

    // Handle analytics screen
    if (currentScreen === 'analytics') {
      return (
        <StudentAnalyticsPage
          onBack={() => setCurrentScreen('dashboard')}
        />
      );
    }

    // Handle permissions screen (only for Manager)
    if (currentScreen === 'permissions') {
      if (role !== 'Manager') {
        setCurrentScreen('dashboard');
        return <DashboardPage onNavigate={handleNavigate} />;
      }
      return (
        <PermissionsManagementPage
          onBack={() => setCurrentScreen('dashboard')}
        />
      );
    }

    // Handle data sync screen (only for Manager)
    if (currentScreen === 'data-sync') {
      if (role !== 'Manager') {
        setCurrentScreen('dashboard');
        return <DashboardPage onNavigate={handleNavigate} />;
      }
      return (
        <DataSyncPage
          onBack={() => setCurrentScreen('dashboard')}
        />
      );
    }

    if (currentScreen === 'reports') {
      if (role !== 'Manager') {
        setCurrentScreen('dashboard');
        return <DashboardPage onNavigate={handleNavigate} />;
      }
      return (
        <ReportsPage
          onBack={() => setCurrentScreen('dashboard')}
        />
      );
    }

    // Handle meetings management screen (only for Manager)
    if (currentScreen === 'manage-meetings') {
      if (role !== 'Manager') {
        setCurrentScreen('dashboard');
        return <DashboardPage onNavigate={handleNavigate} />;
      }
      return (
        <ManagerMeetingPage
          onBack={() => setCurrentScreen('dashboard')}
        />
      );
    }

    // Default screen content
    const screenMap: Record<string, string> = {
      'meetings': 'Meetings',
      'find-tutor': 'Find Tutor',
      'my-progress': 'My Progress',
      'library': 'Library',
      'settings': 'Settings',
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <AppLayout
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        {renderScreenContent()}
      </AppLayout>
      <Footer />
    </div>
  );
}

export default App;

