import { useEffect, useMemo, useState } from 'react';
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
import { TrendingUp, Target, Code, MessageSquare } from 'lucide-react';
import type { ProgressRecord } from '@/domain/entities/progress';
import type { StudentProfile } from '@/domain/entities/student';
import { progressService } from '@/application/services/progressService';
import { studentService } from '@/application/services/studentService';
import { getProgressTrend } from '@/domain/services/progressMetrics';
import { useRole } from '@/contexts/RoleContext';

type TrendPoint = ReturnType<typeof getProgressTrend>;

export function MyProgressScreen() {
  const { role, userId } = useRole();
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
  const [studentRecords, setStudentRecords] = useState<ProgressRecord[]>([]);
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

        const progress = await progressService.getByStudent(targetStudentId);
        if (!mounted) return;
        setCurrentStudent(student);
        setStudentRecords(progress.records);
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

  const radarData = useMemo(
    () => [
      { metric: 'Understanding', value: averageMetrics.understanding },
      { metric: 'Problem Solving', value: averageMetrics.problemSolving },
      { metric: 'Code Quality', value: averageMetrics.codeQuality },
      { metric: 'Participation', value: averageMetrics.participation },
    ],
    [averageMetrics]
  );

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
    return <div className="p-6 text-center text-muted-foreground">Đang tải dữ liệu tiến độ...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-muted-foreground">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Learning Progress</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-sm text-muted-foreground">ID: {currentStudent.studentId}</p>
            <p className="text-sm text-muted-foreground">{currentStudent.personalInfo.major}</p>
            <p className="text-sm text-muted-foreground">Year {currentStudent.personalInfo.year}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-primary">{overallPerformance}%</p>
          <p className="text-sm text-muted-foreground">Overall Performance</p>
        </div>
      </div>

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Understanding</span>
              </div>
              <span className="text-2xl font-bold">{averageMetrics.understanding}%</span>
            </div>
            <Progress value={averageMetrics.understanding} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Problem Solving</span>
              </div>
              <span className="text-2xl font-bold">{averageMetrics.problemSolving}%</span>
            </div>
            <Progress value={averageMetrics.problemSolving} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Code Quality</span>
              </div>
              <span className="text-2xl font-bold">{averageMetrics.codeQuality}%</span>
            </div>
            <Progress value={averageMetrics.codeQuality} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Participation</span>
              </div>
              <span className="text-2xl font-bold">{averageMetrics.participation}%</span>
            </div>
            <Progress value={averageMetrics.participation} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
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
            <CardTitle>Skills Profile</CardTitle>
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
          <TabsTrigger value="history">Session History ({studentRecords.length})</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        {/* Session History Tab */}
        <TabsContent value="history">
          <div className="space-y-4">
            {studentRecords.map((record) => (
              <Card key={record.recordId}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{record.topic}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{record.sessionDate}</span>
                        <span>•</span>
                        <span>Tutor: {record.tutorName}</span>
                      </div>
                    </div>
                    <Badge className={getRatingColor(record.overallRating)}>
                      {record.overallRating}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Understanding</span>
                        <span className="text-sm text-muted-foreground">{record.understanding}%</span>
                      </div>
                      <Progress value={record.understanding} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Problem Solving</span>
                        <span className="text-sm text-muted-foreground">{record.problemSolving}%</span>
                      </div>
                      <Progress value={record.problemSolving} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Code Quality</span>
                        <span className="text-sm text-muted-foreground">{record.codeQuality}%</span>
                      </div>
                      <Progress value={record.codeQuality} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Participation</span>
                        <span className="text-sm text-muted-foreground">{record.participation}%</span>
                      </div>
                      <Progress value={record.participation} className="h-2" />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-1">Tutor Comments:</p>
                    <p className="text-sm text-muted-foreground">{record.tutorComments}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{studentRecords.length}</p>
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
                  {Math.max(...studentRecords.map(r => 
                    (r.understanding + r.problemSolving + r.codeQuality + r.participation) / 4
                  )).toFixed(0)}%
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

