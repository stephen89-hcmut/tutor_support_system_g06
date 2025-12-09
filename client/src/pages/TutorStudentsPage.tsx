import { useState, useMemo, useEffect } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockMeetings } from '@/data/mockMeetings';
import { mockProgressRecords } from '@/data/mockProgress';
import { mockStudents } from '@/data/mockStudents';
import { useToast } from '@/components/ui/use-toast';
import { RecordProgressModal } from '../components/RecordProgressModal';
import type { Meeting } from '@/domain/entities/meeting';
import type { ProgressRecord } from '@/domain/entities/progress';

interface StudentWithProgress {
  studentId: string;
  studentName: string;
  email?: string;
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  avgRating: number;
  latestSession?: string;
  meetings: Meeting[];
  progressRecords: ProgressRecord[];
  status?: 'Active' | 'At Risk';
  department?: string;
}

interface TutorStudentsPageProps {
  onViewStudent?: (studentId: string) => void;
}

export function TutorStudentsPage({ onViewStudent }: TutorStudentsPageProps = {}) {
  console.log('TutorStudentsPage rendering');
  const { userId } = useRole();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All Status' | 'Active' | 'At Risk'>('All Status');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [students, setStudents] = useState<StudentWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const tutorId = userId;
    if (!tutorId) {
      console.warn('No tutorId available');
      setLoading(false);
      return;
    }

    console.log('Loading students for tutor:', tutorId);
    // Get all meetings for this tutor
    const tutorMeetings = mockMeetings.filter(m => m.tutorId === tutorId);
    console.log('Found meetings:', tutorMeetings.length);

    // Group by student
    const studentMap = new Map<string, StudentWithProgress>();

    tutorMeetings.forEach(meeting => {
      if (!studentMap.has(meeting.studentId)) {
        // Tìm dữ liệu student từ mockStudents
        const studentData = mockStudents.find(s => s.id === meeting.studentId);
        
        const studentProgress = mockProgressRecords.filter(
          p => p.studentId === meeting.studentId && p.tutorId === tutorId
        );

        const avgRating =
          studentProgress.length > 0
            ? studentProgress.reduce((sum, p) => {
                const rating = (p as any).studentRating || 0;
                return sum + rating;
              }, 0) / studentProgress.length
            : 0;

        studentMap.set(meeting.studentId, {
          studentId: meeting.studentId,
          studentName: studentData?.name || meeting.studentName,
          email: studentData?.email,
          totalSessions: 0,
          completedSessions: 0,
          upcomingSessions: 0,
          avgRating,
          meetings: [],
          progressRecords: studentProgress,
          status: 'Active', // Sẽ cập nhật sau khi tính xong
          department: studentData?.personalInfo?.major || 'Computer Science',
        });
      }

      const student = studentMap.get(meeting.studentId)!;
      student.meetings.push(meeting);
      student.totalSessions++;

      if (meeting.status === 'Completed') {
        student.completedSessions++;
        student.latestSession = meeting.date;
      } else if (meeting.status === 'Scheduled') {
        student.upcomingSessions++;
      }
    });

    const studentsArray = Array.from(studentMap.values());
    
    // Calculate status based on completion rate
    studentsArray.forEach(student => {
      const completionRate = student.totalSessions > 0 
        ? (student.completedSessions / student.totalSessions) * 100 
        : 0;
      student.status = completionRate < 60 ? 'At Risk' : 'Active';
    });
    
    console.log('Students loaded:', studentsArray.length, 'students');
    if (studentsArray.length > 0) {
      console.log('First student:', studentsArray[0].studentName, 'Sessions:', studentsArray[0].totalSessions);
    }
    setStudents(studentsArray);
    console.log('Students loaded:', Array.from(studentMap.values()).length);
    setLoading(false);
  }, [userId]);

  const filteredStudents = useMemo(() => {
    let result = students;
    
    // Filter by search term (name, email, or student ID)
    if (searchTerm) {
      result = result.filter(s =>
        s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== 'All Status') {
      result = result.filter(s => s.status === statusFilter);
    }
    
    return result;
  }, [students, searchTerm, statusFilter]);

  const handleRecordProgress = (meeting: Meeting) => {
    // Only allow recording for completed meetings
    if (meeting.status !== 'Completed') {
      toast({ title: 'Cannot record', description: 'Only completed meetings can have progress recorded.' });
      return;
    }

    // Check if already has progress record
    const exists = mockProgressRecords.find(
      p => p.sessionId === meeting.id && p.sessionDate === meeting.date
    );
    if (exists) {
      toast({ title: 'Already recorded', description: 'Progress for this session has already been recorded.' });
      return;
    }

    setSelectedMeeting(meeting);
    setShowRecordModal(true);
  };

  const handleRecordSave = async (data: Partial<ProgressRecord>) => {
    if (!selectedMeeting) return;

    try {
      // Create new progress record
      const newRecord: ProgressRecord = {
        recordId: `pr-${selectedMeeting.id}`,
        studentId: selectedMeeting.studentId,
        sessionId: selectedMeeting.id,
        sessionDate: selectedMeeting.date,
        tutorId: selectedMeeting.tutorId,
        tutorName: selectedMeeting.tutorName,
        topic: selectedMeeting.topic,
        attendance: data.attendance || 'Present',
        absenceReason: data.absenceReason,
        understanding: data.understanding || 0,
        problemSolving: data.problemSolving || 0,
        codeQuality: data.codeQuality || 0,
        participation: data.participation || 0,
        overallRating: data.overallRating || 'Good',
        tutorComments: data.tutorComments || '',
        privateNote: data.privateNote,
        createdAt: new Date().toISOString(),
        createdBy: selectedMeeting.tutorId,
      };

      // Add to mock data
      mockProgressRecords.push(newRecord);

      // Close modal and refresh
      setShowRecordModal(false);
      setSelectedMeeting(null);

      // Refresh student list
      const tutorId = userId;
      if (tutorId) {
        const tutorMeetings = mockMeetings.filter(m => m.tutorId === tutorId);
        const studentMap = new Map<string, StudentWithProgress>();

        tutorMeetings.forEach(meeting => {
          if (!studentMap.has(meeting.studentId)) {
            // Tìm dữ liệu student từ mockStudents
            const studentData = mockStudents.find(s => s.id === meeting.studentId);
            
            const studentProgress = mockProgressRecords.filter(
              p => p.studentId === meeting.studentId && p.tutorId === tutorId
            );

            const avgRating =
              studentProgress.length > 0
                ? studentProgress.reduce((sum, p) => {
                    const rating = (p as any).studentRating || 0;
                    return sum + rating;
                  }, 0) / studentProgress.length
                : 0;

            studentMap.set(meeting.studentId, {
              studentId: meeting.studentId,
              studentName: studentData?.name || meeting.studentName,
              email: studentData?.email,
              totalSessions: 0,
              completedSessions: 0,
              upcomingSessions: 0,
              avgRating,
              meetings: [],
              progressRecords: studentProgress,
              status: 'Active',
              department: studentData?.personalInfo?.major || 'Computer Science',
            });
          }

          const student = studentMap.get(meeting.studentId)!;
          student.meetings.push(meeting);
          student.totalSessions++;

          if (meeting.status === 'Completed') {
            student.completedSessions++;
            student.latestSession = meeting.date;
          } else if (meeting.status === 'Scheduled') {
            student.upcomingSessions++;
          }
        });

        const updatedStudents = Array.from(studentMap.values());
        // Calculate status based on completion rate
        updatedStudents.forEach(student => {
          const completionRate = student.totalSessions > 0 
            ? (student.completedSessions / student.totalSessions) * 100 
            : 0;
          student.status = completionRate < 60 ? 'At Risk' : 'Active';
        });
        
        setStudents(updatedStudents);
      }

      toast({ title: 'Success', description: 'Progress recorded successfully.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to save progress.' });
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading students...</div>;
  }

  console.log('Rendering with students:', students.length, 'filtered:', filteredStudents.length);

  // Calculate stats
  const activeStudents = students.filter(s => s.status === 'Active').length;
  const atRiskStudents = students.filter(s => s.status === 'At Risk').length;
  const avgRating = students.length > 0 
    ? (students.reduce((sum, s) => sum + s.avgRating, 0) / students.length).toFixed(1)
    : 0;

  // Helper to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Students</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track your students' progress</p>
        </div>
        <Button variant="outline">
          ↓ Export All
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Students</p>
                <p className="text-3xl font-bold">{students.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Students</p>
                <p className="text-3xl font-bold text-green-600">{activeStudents}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📈</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">At Risk</p>
                <p className="text-3xl font-bold text-yellow-600">{atRiskStudents}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">⚠️</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Rating</p>
                <p className="text-3xl font-bold">{avgRating}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">⭐</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, student ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Status">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="At Risk">At Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-3">
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No students found.
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map(student => {
            const completionRate = student.totalSessions > 0 
              ? (student.completedSessions / student.totalSessions) * 100 
              : 0;
            
            return (
              <Card 
                key={student.studentId} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onViewStudent?.(student.studentId)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 justify-between">
                    {/* Left: Avatar and Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {getInitials(student.studentName)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{student.studentName}</h3>
                          <Badge 
                            variant="outline" 
                            className={student.status === 'Active' 
                              ? 'bg-green-100 text-green-700 border-green-300' 
                              : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                            }
                          >
                            {student.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {student.studentId} • {student.email || 'N/A'} • {student.department || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Sessions and Rating */}
                    <div className="flex items-center gap-6 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Sessions</p>
                        <p className="text-lg font-bold">{student.completedSessions}/{student.totalSessions}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Rating</p>
                        <div className="flex items-center gap-1 justify-center">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-bold">{student.avgRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Progress and Last Session */}
                    <div className="flex items-center gap-6 flex-1 justify-end">
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">Progress</span>
                          <span className="text-xs text-muted-foreground">{completionRate.toFixed(0)}%</span>
                        </div>
                        <Progress value={completionRate} className="h-2" />
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Last Session</p>
                        <p className="text-sm font-semibold">{student.latestSession ? student.latestSession.slice(5) : 'N/A'}</p>
                      </div>

                      {/* Action Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {student.meetings
                            .filter(m => m.status === 'Completed')
                            .slice(0, 3)
                            .map(meeting => {
                              const hasProgress = mockProgressRecords.some(
                                p => p.sessionId === meeting.id && p.sessionDate === meeting.date
                              );
                              return (
                                <DropdownMenuItem
                                  key={meeting.id}
                                  onClick={() => handleRecordProgress(meeting)}
                                  disabled={hasProgress}
                                >
                                  {hasProgress ? '✓ ' : ''}
                                  {meeting.date.slice(5)} - {meeting.topic.split(' - ')[0]}
                                </DropdownMenuItem>
                              );
                            })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Record Progress Modal */}
      {showRecordModal && selectedMeeting && (
        <RecordProgressModal
          meeting={selectedMeeting}
          onSave={handleRecordSave}
          onCancel={() => {
            setShowRecordModal(false);
            setSelectedMeeting(null);
          }}
        />
      )}
    </div>
  );
}

export default TutorStudentsPage;
