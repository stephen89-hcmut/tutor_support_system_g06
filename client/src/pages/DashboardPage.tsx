import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Calendar,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  BarChart3,
  Bell,
  Sparkles,
  Activity,
  Shield,
} from 'lucide-react';
import type { Meeting } from '@/domain/entities/meeting';
import { meetingService } from '@/application/services/meetingService';
import { format, startOfWeek, eachDayOfInterval, subMonths, startOfMonth } from 'date-fns';
import { useRole } from '@/contexts/RoleContext';

interface DashboardPageProps {
  onNavigate?: (screen: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { role, userId } = useRole();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadMeetings = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load meetings based on role
        let data: Meeting[];
        if (role === 'Student' && userId) {
          data = await meetingService.getByStudent(userId);
        } else if (role === 'Tutor' && userId) {
          data = await meetingService.getByTutor(userId);
        } else {
          data = await meetingService.getAll();
        }
        if (!mounted) return;
        setMeetings(data);
      } catch (err) {
        if (!mounted) return;
        setError('Không thể tải dữ liệu dashboard.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadMeetings();
    return () => {
      mounted = false;
    };
  }, [role, userId]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const upcoming = meetings.filter((m) => m.status === 'Scheduled').length;
    const total = meetings.length;
    const completed = meetings.filter((m) => m.status === 'Completed').length;
    const activeTutors = new Set(meetings.map((m) => m.tutorId)).size;

    return { upcoming, total, completed, activeTutors };
  }, [meetings]);

  // This Week's Meetings Data
  const weeklyMeetingsData = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const weekDays = eachDayOfInterval({
      start: weekStart,
      end: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
    });

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return dayNames.map((day, index) => {
      const dayDate = weekDays[index];
      const dayStr = format(dayDate, 'yyyy-MM-dd');
      const count = meetings.filter(
        (m) => m.date === dayStr && m.status === 'Scheduled',
      ).length;
      
      return {
        day,
        meetings: count,
      };
    });
  }, [meetings]);

  // Monthly Trend Data (Last 6 months)
  const monthlyTrendData = useMemo(() => {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthStr = format(monthStart, 'yyyy-MM');
      
      const count = meetings.filter((m) => {
        const meetingMonth = m.date.substring(0, 7);
        return meetingMonth === monthStr;
      }).length;
      
      months.push({
        month: monthNames[5 - i],
        meetings: count,
      });
    }
    
    return months;
  }, [meetings]);

  // Recent Meetings (Last 5, sorted by date)
  const recentMeetings = useMemo(() => {
    return [...meetings]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [meetings]);

  const nextMeeting = useMemo(() => {
    return [...meetings]
      .filter((m) => m.status === 'Scheduled')
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())[0];
  }, [meetings]);

  const getRatingColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-500 text-white';
      case 'Completed':
        return 'bg-green-500 text-white';
      case 'Cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Đang tải dữ liệu tổng quan...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-muted-foreground">{error}</div>;
  }

  const renderWelcome = () => {
    if (role === 'Student') {
      return (
        <>
          <h1 className="text-3xl font-bold mb-2">Chào bạn, chúc học tốt hôm nay!</h1>
          <p className="text-muted-foreground">Kiểm tra lịch sắp tới, đồng bộ dữ liệu và xem gợi ý Tutor phù hợp.</p>
        </>
      );
    }
    if (role === 'Tutor') {
      return (
        <>
          <h1 className="text-3xl font-bold mb-2">Chào Tutor, đây là việc cần làm hôm nay</h1>
          <p className="text-muted-foreground">Duyệt yêu cầu đặt lịch, điểm danh và ghi nhận tiến độ cho các buổi đã hoàn thành.</p>
        </>
      );
    }
    if (role === 'Manager') {
      return (
        <>
          <h1 className="text-3xl font-bold mb-2">System Overview</h1>
          <p className="text-muted-foreground">Theo dõi sức khỏe hệ thống, cảnh báo và các yêu cầu phê duyệt.</p>
        </>
      );
    }
    return (
      <>
        <h1 className="text-3xl font-bold mb-2">Welcome</h1>
        <p className="text-muted-foreground">Manage your academic meetings, track progress, and collaborate.</p>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>{renderWelcome()}</div>

       {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Upcoming Meetings
                </p>
                <p className="text-3xl font-bold">{stats.upcoming}</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Meetings
                </p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Completed
                </p>
                <p className="text-3xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Active Tutors
                </p>
                <p className="text-3xl font-bold">{stats.activeTutors}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {role === 'Student' && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                className="bg-primary hover:bg-primary-dark text-white"
                onClick={() => onNavigate?.('find-tutor')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book New Meeting
              </Button>
              <Button variant="outline" onClick={() => onNavigate?.('meetings')}>
                <Calendar className="mr-2 h-4 w-4" />
                View All Meetings
              </Button>
              <Button variant="outline" onClick={() => onNavigate?.('my-progress')}>
                <TrendingUp className="mr-2 h-4 w-4" />
                My Progress
              </Button>
              <Button variant="outline" onClick={() => onNavigate?.('analytics')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student focus: next meeting + notifications + AI recommendations */}
      {role === 'Student' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Buổi học sắp tới</CardTitle>
            </CardHeader>
            <CardContent>
              {nextMeeting ? (
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{nextMeeting.topic}</p>
                    <h3 className="text-xl font-semibold">Tutor: {nextMeeting.tutorName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {nextMeeting.date} – {nextMeeting.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Scheduled</Badge>
                    <Button onClick={() => onNavigate?.('meetings')}>Xem chi tiết</Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Chưa có buổi học sắp tới.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Thông báo</CardTitle>
              <Badge variant="secondary">Mới</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Bell className="h-4 w-4 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Nhắc lịch #{i}</p>
                    <p className="text-muted-foreground">Tutor chấp nhận yêu cầu / có tài liệu mới.</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {role === 'Student' && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Gợi ý Tutor phù hợp</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate?.('find-tutor')}>
              <Sparkles className="h-4 w-4 mr-2" />Xem thêm
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg border hover:border-primary/50 transition-colors">
                <p className="text-sm text-muted-foreground">AI Suggestion #{i}</p>
                <h3 className="font-semibold">Tutor {i}</h3>
                <p className="text-xs text-muted-foreground">Chuyên môn: DSA, OS, DB</p>
                <Button variant="link" className="px-0" onClick={() => onNavigate?.('find-tutor')}>
                  Xem chi tiết
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tutor focus */}
      {role === 'Tutor' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Việc cần làm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold">Yêu cầu đặt lịch đang chờ</p>
                  <p className="text-sm text-muted-foreground">Duyệt/khước từ các booking mới.</p>
                </div>
                <Button variant="outline" onClick={() => onNavigate?.('meetings')}>Xử lý</Button>
              </div>
              <div className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold">Ghi nhận tiến độ</p>
                  <p className="text-sm text-muted-foreground">Hoàn tất biên bản cho buổi đã xong.</p>
                </div>
                <Button variant="outline" onClick={() => onNavigate?.('students')}>Ghi nhận</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Buổi đã dạy</span>
                <span className="font-semibold">{stats.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Buổi sắp tới</span>
                <span className="font-semibold">{stats.upcoming}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Số sinh viên</span>
                <span className="font-semibold">{stats.activeTutors}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manager focus */}
      {role === 'Manager' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'SSO', status: 'Online' },
                { label: 'Datacore', status: 'Online' },
                { label: 'AI Service', status: 'Online' },
              ].map((svc) => (
                <div key={svc.label} className="flex items-center justify-between">
                  <span className="text-sm">{svc.label}</span>
                  <Badge className="bg-green-500 text-white">{svc.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Meetings (total)</span>
                <span className="font-semibold">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Upcoming</span>
                <span className="font-semibold">{stats.upcoming}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="font-semibold">{stats.completed}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cảnh báo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Shield className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Alert #{i}</p>
                    <p className="text-muted-foreground">User có nhiều warning / feedback tiêu cực.</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* This Week's Meetings */}
        <Card>
          <CardHeader>
            <CardTitle>This Week's Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyMeetingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 8]} />
                <Tooltip />
                <Bar dataKey="meetings" fill="#0A84D6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 40]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="meetings"
                  stroke="#0A84D6"
                  strokeWidth={2}
                  name="Meetings"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Meetings */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent Meetings</CardTitle>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{meeting.topic}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Tutor: {meeting.tutorName}</span>
                    <span>•</span>
                    <span>
                      {meeting.date} - {meeting.time}
                    </span>
                  </div>
                </div>
                <Badge className={getRatingColor(meeting.status)}>
                  {meeting.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

