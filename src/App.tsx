import { useState, useEffect } from 'react';
import { AppLayout } from './components/AppLayout';
import { useRole } from './contexts/RoleContext';
import { LoginScreen } from './screens/LoginScreen';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { StudentManagementScreen } from './screens/StudentManagementScreen';
import { StudentDetailScreen } from './screens/StudentDetailScreenNew';
import { MeetingsScreen } from './screens/MeetingsScreen';
import { MeetingManagementScreen } from './screens/MeetingManagementScreen';
import { DocumentLibraryScreen } from './screens/DocumentLibraryScreen';
import { TutorProfileScreen } from './screens/TutorProfileScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { PermissionsManagementScreen } from './screens/PermissionsManagementScreen';
import { DataSyncScreen } from './screens/DataSyncScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { AIFeedbackAnalysisScreen } from './screens/AIFeedbackAnalysisScreen';
import { FeedbackScreen } from './screens/FeedbackScreen';
import { MyProgressScreen } from './screens/MyProgressScreen';
import { RecordProgressScreen } from './screens/RecordProgressScreen';
import { RecordProgressScreenNew } from './screens/RecordProgressScreenNew';
import { DashboardScreen } from './screens/DashboardScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { FindTutorScreen } from './screens/FindTutorScreen';
import { StudentAnalyticsScreen } from './screens/StudentAnalyticsScreen';
import { TutorStudentsScreen } from './screens/TutorStudentsScreen';
import type { UserEntity } from '@/domain/entities/user';
import { meetingService } from '@/application/services/meetingService';
import { useToast } from './components/ui/use-toast';

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
  const { role, setRole, setUserId, setUserName } = useRole();
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
    const token = localStorage.getItem('hcmut_auth_token') || sessionStorage.getItem('hcmut_auth_token');
    const savedUserData = localStorage.getItem('hcmut_user_data') || sessionStorage.getItem('hcmut_user_data');
    
    if (token && savedUserData) {
      try {
        const userData = JSON.parse(savedUserData);
        const normalizedRole = normalizeStoredRole(userData.role);
        if (!normalizedRole) {
          throw new Error('Invalid role');
        }
        setRole(normalizedRole);
        setUserId(userData.userId);
        setUserName(userData.username);
        setIsAuthenticated(true);
      } catch (e) {
        // Invalid data, clear it
        localStorage.removeItem('hcmut_auth_token');
        localStorage.removeItem('hcmut_user_data');
        sessionStorage.removeItem('hcmut_auth_token');
        sessionStorage.removeItem('hcmut_user_data');
      }
    }
  }, [setRole, setUserId, setUserName]);

  const handleLogin = (user: UserEntity) => {
    setRole(user.role);
    setUserId(user.userId);
    setUserName(user.username);
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('hcmut_auth_token');
    localStorage.removeItem('hcmut_user_data');
    sessionStorage.removeItem('hcmut_auth_token');
    sessionStorage.removeItem('hcmut_user_data');
    setRole(null);
    setUserId(null);
    setUserName(null);
    setIsAuthenticated(false);
    setCurrentScreen('dashboard');
    toast({
      title: 'Đã đăng xuất',
      description: 'Bạn đã đăng xuất thành công.',
    });
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
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
        <RecordProgressScreenNew
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
        <StudentDetailScreen
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
        return <TutorStudentsScreen onViewStudent={handleViewStudent} />;
      }
      // For manager: show all students management
      return (
        <StudentManagementScreen
          onViewStudent={handleViewStudent}
          onViewProgress={handleViewProgress}
          onViewFeedback={handleViewFeedback}
          onRecordProgress={handleRecordProgress}
        />
      );
    }

    // Handle meetings screen
    if (currentScreen === 'meetings') {
      return (
        <MeetingsScreen
          onCancel={handleCancelMeeting}
          onBookNewMeeting={() => setCurrentScreen('book-meeting')}
        />
      );
    }

    // Handle library screen
    if (currentScreen === 'library') {
      return <DocumentLibraryScreen />;
    }

    // Handle find tutor / book meeting screen (Student only - UCB1.1)
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
      return (
        <FindTutorScreen
          onViewTutorProfile={(tutorId) => {
            setCurrentStudentId(tutorId); // Reuse for tutor ID
            setPreviousScreen(currentScreen);
            setCurrentScreen('tutorProfile');
          }}
          onBookingSuccess={() => {
            setCurrentScreen('meetings');
          }}
        />
      );
    }


    // Handle tutor profile screen
    if (currentScreen === 'tutorProfile' && currentStudentId) {
      return (
        <TutorProfileScreen
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
        <AIFeedbackAnalysisScreen
          onBack={() => setShowAIFeedbackAnalysis(false)}
        />
      );
    }

    // Handle feedback screen
    if (currentScreen === 'feedback') {
      return (
        <FeedbackScreen
          onAIAnalysis={() => setShowAIFeedbackAnalysis(true)}
        />
      );
    }

    // Handle my progress screen
    if (currentScreen === 'my-progress') {
      return <MyProgressScreen />;
    }

    // Handle settings screen (not available for Manager)
    if (currentScreen === 'settings') {
      if (role === 'Manager') {
        setCurrentScreen('dashboard');
        return <DashboardScreen onNavigate={handleNavigate} />;
      }
      return <SettingsScreen />;
    }

    // Handle profile screen (not available for Manager)
    if (currentScreen === 'profile') {
      if (role === 'Manager') {
        setCurrentScreen('dashboard');
        return <DashboardScreen onNavigate={handleNavigate} />;
      }
      return (
        <ProfileScreen
          onBack={() => setCurrentScreen('dashboard')}
        />
      );
    }

    // Handle dashboard screen
    if (currentScreen === 'dashboard') {
      return <DashboardScreen onNavigate={handleNavigate} />;
    }

    // Handle analytics screen
    if (currentScreen === 'analytics') {
      return (
        <StudentAnalyticsScreen
          onBack={() => setCurrentScreen('dashboard')}
        />
      );
    }

    // Handle permissions screen (only for Manager)
    if (currentScreen === 'permissions') {
      if (role !== 'Manager') {
        setCurrentScreen('dashboard');
        return <DashboardScreen onNavigate={handleNavigate} />;
      }
      return (
        <PermissionsManagementScreen
          onBack={() => setCurrentScreen('dashboard')}
        />
      );
    }

    // Handle data sync screen (only for Manager)
    if (currentScreen === 'data-sync') {
      if (role !== 'Manager') {
        setCurrentScreen('dashboard');
        return <DashboardScreen onNavigate={handleNavigate} />;
      }
      return (
        <DataSyncScreen
          onBack={() => setCurrentScreen('dashboard')}
        />
      );
    }

    if (currentScreen === 'reports') {
      if (role !== 'Manager') {
        setCurrentScreen('dashboard');
        return <DashboardScreen onNavigate={handleNavigate} />;
      }
      return (
        <ReportsScreen
          onBack={() => setCurrentScreen('dashboard')}
        />
      );
    }

    // Handle students list screen (only for Manager)
    if (currentScreen === 'manage-meetings') {
      if (role !== 'Manager') {
        setCurrentScreen('dashboard');
        return <DashboardScreen onNavigate={handleNavigate} />;
      }
      return (
        <MeetingManagementScreen
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

