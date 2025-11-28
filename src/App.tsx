import { useState, useEffect } from 'react';
import { AppLayout } from './components/AppLayout';
import { useRole } from './contexts/RoleContext';
import { LoginScreen } from './screens/LoginScreen';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StudentManagementScreen } from './screens/StudentManagementScreen';
import { StudentDetailScreen } from './screens/StudentDetailScreen';
import { MeetingsScreen } from './screens/MeetingsScreen';
import { DocumentLibraryScreen } from './screens/DocumentLibraryScreen';
import { TutorProfileScreen } from './screens/TutorProfileScreen';
import { AIFeedbackAnalysisScreen } from './screens/AIFeedbackAnalysisScreen';
import { FeedbackScreen } from './screens/FeedbackScreen';
import { MyProgressScreen } from './screens/MyProgressScreen';
import { RecordProgressScreen } from './screens/RecordProgressScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { FindTutorScreen } from './screens/FindTutorScreen';
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
    setRecordProgressStudentId(studentId);
    setPreviousScreen(currentScreen);
    setShowRecordProgress(true);
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
    // Handle student detail screen
    if (currentScreen === 'studentDetail' && currentStudentId) {
      return (
        <StudentDetailScreen
          studentId={currentStudentId}
          onBack={handleBack}
          onRecordProgress={handleRecordProgress}
          onViewProgress={handleViewProgress}
          onViewAllFeedback={handleViewAllFeedback}
          onExport={handleExport}
        />
      );
    }

    // Handle students management screen
    if (currentScreen === 'students') {
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

    // Handle find tutor screen
    if (currentScreen === 'find-tutor') {
      return <FindTutorScreen />;
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

    // Handle record progress screen
    if (showRecordProgress && recordProgressStudentId) {
      return (
        <RecordProgressScreen
          studentId={recordProgressStudentId}
          onBack={() => {
            setShowRecordProgress(false);
            setRecordProgressStudentId(null);
            setCurrentScreen(previousScreen);
          }}
          onSave={handleRecordProgressSave}
        />
      );
    }

    // Handle settings screen
    if (currentScreen === 'settings') {
      return <SettingsScreen />;
    }

    // Handle dashboard screen
    if (currentScreen === 'dashboard') {
      return <DashboardScreen />;
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

