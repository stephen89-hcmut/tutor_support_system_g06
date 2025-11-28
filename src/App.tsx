import { useState } from 'react';
import { AppLayout } from './components/AppLayout';
import { useRole } from './contexts/RoleContext';
import { StudentManagementScreen } from './screens/StudentManagementScreen';
import { StudentDetailScreen } from './screens/StudentDetailScreen';
import { MeetingsScreen } from './screens/MeetingsScreen';
import { DocumentLibraryScreen } from './screens/DocumentLibraryScreen';
import { FindTutorScreen } from './screens/FindTutorScreen';
import { AIFeedbackAnalysisScreen } from './screens/AIFeedbackAnalysisScreen';
import { FeedbackScreen } from './screens/FeedbackScreen';
import { MyProgressScreen } from './screens/MyProgressScreen';
import { RecordProgressScreen } from './screens/RecordProgressScreen';
import { mockMeetings } from './data/mockMeetings';

function App() {
  const { role } = useRole();
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const [previousScreen, setPreviousScreen] = useState<string>('students');
  const [showAIFeedbackAnalysis, setShowAIFeedbackAnalysis] = useState(false);
  const [showRecordProgress, setShowRecordProgress] = useState(false);
  const [recordProgressStudentId, setRecordProgressStudentId] = useState<string | null>(null);

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

  const handleCancelMeeting = (meetingId: string, cancelledBy: string, reason: string) => {
    // Update meeting status in mock data
    const meeting = mockMeetings.find(m => m.id === meetingId);
    if (meeting) {
      meeting.status = 'Cancelled';
      meeting.cancelledBy = cancelledBy as any;
      meeting.cancellationReason = reason;
    }
    console.log('Meeting cancelled:', meetingId, cancelledBy, reason);
  };

  const handleRescheduleMeeting = (meetingId: string) => {
    // This is handled within MeetingsScreen
    console.log('Reschedule meeting:', meetingId);
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
          onReschedule={handleRescheduleMeeting}
          onCancel={handleCancelMeeting}
        />
      );
    }

    // Handle library screen
    if (currentScreen === 'library') {
      return <DocumentLibraryScreen />;
    }

    // Handle find tutors screen
    if (currentScreen === 'find-tutors') {
      return <FindTutorScreen />;
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

    // Default screen content
    const screenMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'meetings': 'Meetings',
      'find-tutors': 'Find Tutors',
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
    <AppLayout currentScreen={currentScreen} onNavigate={handleNavigate}>
      {renderScreenContent()}
    </AppLayout>
  );
}

export default App;

