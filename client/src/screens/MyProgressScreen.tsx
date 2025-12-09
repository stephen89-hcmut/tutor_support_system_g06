import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Target, Code, MessageSquare, ChevronLeft, User, Brain, Lightbulb, Users } from 'lucide-react';
import type { ProgressRecord } from '@/domain/entities/progress';
import type { StudentProfile } from '@/domain/entities/student';
import type { Meeting } from '@/domain/entities/meeting';
import { progressService } from '@/application/services/progressService';
import { studentService } from '@/application/services/studentService';
import { meetingService } from '@/application/services/meetingService';
import { getProgressTrend } from '@/domain/services/progressMetrics';
import { useRole } from '@/contexts/RoleContext';
import { useLanguage } from '@/contexts/useLanguage';

type TrendPoint = ReturnType<typeof getProgressTrend>;

export function MyProgressPage() {
  const { role, userId } = useRole();
  const { t } = useLanguage();
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
  const [studentRecords, setStudentRecords] = useState<ProgressRecord[]>([]);
  const [completedMeetings, setCompletedMeetings] = useState<Meeting[]>([]);
  const [overallPerformance, setOverallPerformance] = useState(0);
  const [averageMetrics, setAverageMetrics] = useState({
    understanding: 0,
    problemSolving: 0,
    codeQuality: 0,
    participation: 0,
  });
  const [progressTrend, setProgressTrend] = useState<TrendPoint>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        let student: StudentProfile | null = null;
        let targetStudentId: string;

        // Nếu đang đăng nhập với role Student thì dùng userId (s1, s2, ...) cho progress
        if (role === 'Student' && userId) {
          targetStudentId = userId;
          student = await studentService.getByAccountUserId(userId);
        } else {
          // Fallback demo: dùng student hồ sơ đầu tiên
          const students = await studentService.list();
          student = students[0] ?? null;
          targetStudentId = student ? student.id : '1';
        }

        // Load progress records and meetings
        const [progress, meetings] = await Promise.all([
          progressService.getByStudent(targetStudentId),
          meetingService.getByStudent(targetStudentId),
        ]);

        if (!mounted) return;

        // Filter only completed meetings
        const completedMeetingsList = meetings.filter(m => m.status === 'Completed');

        setCurrentStudent(student);
        setStudentRecords(progress.records);
        setCompletedMeetings(completedMeetingsList);
        setOverallPerformance(progress.overall);
        setAverageMetrics(progress.averages);
        setProgressTrend(progress.trend);
      } catch (err) {
        if (!mounted) return;
        setError('Không thể tải dữ liệu tiến độ.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [role, userId]);

  const radarData = [
    { metric: 'Understanding', value: averageMetrics.understanding },
    { metric: 'Problem Solving', value: averageMetrics.problemSolving },
    { metric: 'Code Quality', value: averageMetrics.codeQuality },
    { metric: 'Participation', value: averageMetrics.participation },
  ];

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Excellent':
        return 'bg-green-500 text-white';
      case 'Good':
        return 'bg-blue-500 text-white';
      case 'Average':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading || !currentStudent) {
    return <div className="p-6 text-center text-muted-foreground">{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-muted-foreground">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{t('progress.breadcrumb.dashboard')}</span>
        <span>›</span>
        <span className="text-foreground font-medium">{t('progress.breadcrumb.progress')}</span>
      </div>

      {/* Back Button */}
      <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4" />
        <span>{t('progress.back')}</span>
      </button>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
                <User className="h-8 w-8 text-pink-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t('progress.title')}</h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span>ID: {currentStudent.studentId}</span>
                  <span>•</span>
                  <span>{currentStudent.personalInfo.major}</span>
                  <span>•</span>
                  <span>Year {currentStudent.personalInfo.year}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold text-blue-600">{overallPerformance}%</p>
              <p className="text-sm text-muted-foreground mt-1">{t('progress.overall')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{t('progress.understanding')}</span>
            </div>
            <p className="text-2xl font-bold mb-2">{averageMetrics.understanding}%</p>
            <Progress value={averageMetrics.understanding} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{t('progress.problemsolving')}</span>
            </div>
            <p className="text-2xl font-bold mb-2">{averageMetrics.problemSolving}%</p>
            <Progress value={averageMetrics.problemSolving} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Code className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{t('progress.codequality')}</span>
            </div>
            <p className="text-2xl font-bold mb-2">{averageMetrics.codeQuality}%</p>
            <Progress value={averageMetrics.codeQuality} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{t('progress.participation')}</span>
            </div>
            <p className="text-2xl font-bold mb-2">{averageMetrics.participation}%</p>
            <Progress value={averageMetrics.participation} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('progress.overtime')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="session" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#0A84D6"
                  strokeWidth={2}
                  name="Average"
                />
                <Line
                  type="monotone"
                  dataKey="problemSolving"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Problem Solving"
                />
                <Line
                  type="monotone"
                  dataKey="understanding"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Understanding"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('progress.skills')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Skills"
                  dataKey="value"
                  stroke="#0A84D6"
                  fill="#0A84D6"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">{t('progress.sessionhistory')} ({completedMeetings.length})</TabsTrigger>
          <TabsTrigger value="statistics">{t('progress.statistics')}</TabsTrigger>
        </TabsList>

        {/* Session History Tab */}
        <TabsContent value="history">
          {completedMeetings.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {t('progress.nosessions')}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {(() => {
                // Group records by subject
                const grouped = new Map<string, ProgressRecord[]>();
                studentRecords
                  .filter(record => completedMeetings.some(m => m.id === record.sessionId))
                  .forEach(record => {
                    const subjectMatch = record.topic.match(/^([^-]+)/);
                    const subject = subjectMatch ? subjectMatch[1].trim() : 'Other';
                    if (!grouped.has(subject)) {
                      grouped.set(subject, []);
                    }
                    grouped.get(subject)!.push(record);
                  });
                
                // Sort each group by date
                grouped.forEach(records => {
                  records.sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
                });
                
                return Array.from(grouped.entries()).map(([subject, records]) => (
                  <div key={subject} className="space-y-3">
                    <h3 className="text-lg font-semibold text-primary">{subject}</h3>
                    <div className="space-y-3">
                      {records.map((record) => (
                        <Card key={record.recordId}>
                    <CardContent className="p-6">
                      {/* Session Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-base">{record.topic}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{record.sessionDate}</span>
                            <span>•</span>
                            <span>{t('progress.tutor')}: {record.tutorName}</span>
                          </div>
                        </div>
                        <Badge className={getRatingColor(record.overallRating)}>
                          {record.overallRating}
                        </Badge>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">{t('progress.understanding')}</span>
                            <span className="text-xs font-semibold">{record.understanding}%</span>
                          </div>
                          <Progress value={record.understanding} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">{t('progress.problemsolving')}</span>
                            <span className="text-xs font-semibold">{record.problemSolving}%</span>
                          </div>
                          <Progress value={record.problemSolving} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">{t('progress.codequality')}</span>
                            <span className="text-xs font-semibold">{record.codeQuality}%</span>
                          </div>
                          <Progress value={record.codeQuality} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">{t('progress.participation')}</span>
                            <span className="text-xs font-semibold">{record.participation}%</span>
                          </div>
                          <Progress value={record.participation} className="h-2" />
                        </div>
                      </div>

                      {/* Tutor Comments */}
                      <div className="border-t pt-3">
                        <p className="text-xs font-medium mb-1">{t('progress.tutorcomments')}</p>
                        <p className="text-xs text-muted-foreground">{record.tutorComments}</p>
                      </div>
                    </CardContent>
                  </Card>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Completed Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{completedMeetings.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{overallPerformance}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Best Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {studentRecords.length > 0 ? Math.max(...studentRecords.map(r => 
                    (r.understanding + r.problemSolving + r.codeQuality + r.participation) / 4
                  )).toFixed(0) : '0'}%
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

