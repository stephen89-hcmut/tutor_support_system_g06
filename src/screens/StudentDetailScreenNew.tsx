import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Star, Calendar, Clock, FileText, TrendingUp, MessageCircle, Download } from 'lucide-react';
import type { StudentProfile } from '@/domain/entities/student';
import type { Meeting } from '@/domain/entities/meeting';
import type { ProgressRecord } from '@/domain/entities/progress';
import { studentService } from '@/application/services/studentService';
import { meetingService } from '@/application/services/meetingService';
import { progressService } from '@/application/services/progressService';
import { mockStudentAccounts } from '@/data/mockUsers';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,

  ResponsiveContainer,
} from 'recharts';

interface StudentDetailScreenProps {
  studentId: string;
  onBack: () => void;
  onRecordProgress: (studentId: string) => void;
}

export function StudentDetailScreen({
  studentId,
  onBack,
  onRecordProgress,
}: StudentDetailScreenProps) {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading student detail for:', studentId);
        const [studentData, studentMeetings, progress] = await Promise.all([
          studentService.getByAccountUserId(studentId),
          meetingService.getByStudent(studentId),
          progressService.getListProgressById(studentId),
        ]);
        
        console.log('Student data loaded:', studentData);
        console.log('Meetings loaded:', studentMeetings.length);
        console.log('Progress records loaded:', progress.length);
        
        // If student not found in mockStudents, create profile from account
        let finalStudent = studentData;
        if (!finalStudent) {
          const account = mockStudentAccounts.find(acc => acc.userId === studentId);
          if (account) {
            console.log('Creating dynamic profile for account:', account.username);
            const currentYear = new Date().getFullYear();
            const yearsSinceEnrollment = currentYear - account.enrollmentYear;
            const currentYearLevel = Math.min(yearsSinceEnrollment + 1, 4);
            
            finalStudent = {
              id: account.userId,
              name: account.username.replace('sv.', '').split(/(?=[A-Z])/).join(' '),
              studentId: account.studentId,
              progress: 75,
              status: 'Active' as const,
              rating: 4.0,
              email: account.email,
              phone: '+84 ' + Math.floor(Math.random() * 900000000 + 100000000),
              joinDate: account.createdAt.split('T')[0],
              lastSession: studentMeetings.length > 0 ? studentMeetings[0].date : undefined,
              totalSessions: studentMeetings.length,
              personalInfo: {
                dateOfBirth: `${account.enrollmentYear - 18}-01-01`,
                address: 'Ho Chi Minh City',
                major: account.majors,
                department: 'School of Computer Science and Engineering',
                year: currentYearLevel,
              },
              sessionHistory: [],
              progressData: [],
              feedback: [],
            };
          }
        }
        
        setStudent(finalStudent ?? null);
        setMeetings(studentMeetings);
        setProgressRecords(progress);
      } catch (error) {
        console.error('Error loading student detail:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [studentId]);

  if (loading || !student) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  const completedMeetings = meetings.filter(m => m.status === 'Completed');
  const upcomingMeetings = meetings.filter(m => m.status === 'In Progress');
  const cancelledMeetings = meetings.filter(m => m.status === 'Cancelled');

  // Calculate average rating
  const avgRating = progressRecords.length > 0
    ? progressRecords.reduce((sum, record) => {
        const ratingValue = record.overallRating === 'Excellent' ? 5 : 
                           record.overallRating === 'Good' ? 4 : 
                           record.overallRating === 'Average' ? 3 : 2;
        return sum + ratingValue;
      }, 0) / progressRecords.length
    : 0;

  // Calculate overall progress
  const overallProgress = progressRecords.length > 0
    ? Math.round(
        progressRecords.reduce((sum, r) => 
          sum + (r.understanding + r.problemSolving + r.codeQuality + r.participation) / 4, 0
        ) / progressRecords.length
      )
    : 0;

  // Progress trend data
  const progressTrend = progressRecords
    .slice(-4)
    .map((record) => ({
      month: new Date(record.sessionDate).toLocaleDateString('en-US', { month: 'short' }),
      progress: Math.round((record.understanding + record.problemSolving + record.codeQuality + record.participation) / 4),
    }));

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>My Students</span>
        <span>›</span>
        <span className="text-foreground font-medium">Student Profile</span>
      </div>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            {/* Left: Student Info */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{student.name}</h1>
                  <Badge className="bg-green-500 text-white">Active</Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Student ID: {student.studentId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{student.phone || '+84 123 456 789'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={() => onRecordProgress(studentId)}>
                <FileText className="h-4 w-4 mr-2" />
                Record Progress
              </Button>
              <Button variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Progress
              </Button>
              <Button variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                All Feedback
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-4 mt-6">
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Department</div>
                <div className="font-semibold">{student.personalInfo?.major || 'Computer Science'}</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Class / Year</div>
                <div className="font-semibold">K21 / 3rd Year</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Total Sessions</div>
                <div className="font-semibold">{completedMeetings.length}/{meetings.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Avg. Rating</div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold">{avgRating.toFixed(1)}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">GPA</div>
                <div className="font-semibold">3.75</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="sessions">Session History</TabsTrigger>
          <TabsTrigger value="progress">Progress & Performance</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-6">Personal Information</h3>
              <div className="grid grid-cols-2 gap-x-16 gap-y-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Full Name</div>
                  <div className="font-medium">{student.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Student ID</div>
                  <div className="font-medium">{student.studentId}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Email Address</div>
                  <div className="font-medium">{student.email}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Phone Number</div>
                  <div className="font-medium">{student.phone || '+84 123 456 789'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Department</div>
                  <div className="font-medium">{student.personalInfo?.major || 'Computer Science'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Class / Year</div>
                  <div className="font-medium">K21 / 3rd Year</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Address</div>
                  <div className="font-medium">District 1, Ho Chi Minh City</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Enrollment Date</div>
                  <div className="font-medium">1/9/2021</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Session History Tab */}
        <TabsContent value="sessions">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Session History</h3>
                <div className="flex gap-2 text-sm">
                  <span>Completed: {completedMeetings.length}</span>
                  <span>Upcoming: {upcomingMeetings.length}</span>
                  <span>Cancelled: {cancelledMeetings.length}</span>
                </div>
              </div>
              <div className="space-y-3">
                {completedMeetings.map((meeting) => {
                  const progress = progressRecords.find(p => p.sessionId === meeting.id);
                  const rating = progress ? (
                    progress.overallRating === 'Excellent' ? 5 : 
                    progress.overallRating === 'Good' ? 4 : 
                    progress.overallRating === 'Average' ? 3 : 2
                  ) : 0;

                  return (
                    <Card key={meeting.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold">{meeting.topic}</h4>
                              <Badge className="bg-green-500 text-white">Completed</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{meeting.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{meeting.time}</span>
                              </div>
                            </div>
                            {progress && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {progress.tutorComments}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress & Performance Tab */}
        <TabsContent value="progress">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">{overallProgress}%</div>
                <Progress value={overallProgress} className="h-2 mb-4" />
                <Button variant="outline" className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Detailed Progress
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Progress Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={progressTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="progress" stroke="#2563eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Student Feedback</h3>
              <div className="space-y-4">
                {progressRecords.slice(0, 3).map((record) => (
                  <Card key={record.recordId}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{record.topic}</h4>
                          <p className="text-sm text-muted-foreground">{record.sessionDate}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => {
                            const rating = record.overallRating === 'Excellent' ? 5 : 
                                         record.overallRating === 'Good' ? 4 : 
                                         record.overallRating === 'Average' ? 3 : 2;
                            return (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} 
                              />
                            );
                          })}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Very helpful session! The tutor explained complex concepts clearly.
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Pending Response</Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <MessageCircle className="h-4 w-4 mr-2" />
                View All Feedback
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
