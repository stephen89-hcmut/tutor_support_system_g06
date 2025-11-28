import { useMemo } from 'react';
import { useRole } from '@/contexts/RoleContext';
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
} from 'lucide-react';
import { mockMeetings } from '@/data/mockMeetings';
import { mockTutors } from '@/data/mockTutors';
import { format, startOfWeek, eachDayOfInterval, subMonths, startOfMonth } from 'date-fns';

export function DashboardScreen() {
  const { role } = useRole();

  // Calculate summary statistics
  const stats = useMemo(() => {
    const upcoming = mockMeetings.filter(m => m.status === 'Scheduled').length;
    const total = mockMeetings.length;
    const completed = mockMeetings.filter(m => m.status === 'Completed').length;
    const activeTutors = new Set(mockMeetings.map(m => m.tutorId)).size;

    return { upcoming, total, completed, activeTutors };
  }, []);

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
      const count = mockMeetings.filter(
        m => m.date === dayStr && m.status === 'Scheduled'
      ).length;
      
      return {
        day,
        meetings: count,
      };
    });
  }, []);

  // Monthly Trend Data (Last 6 months)
  const monthlyTrendData = useMemo(() => {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthStr = format(monthStart, 'yyyy-MM');
      
      const count = mockMeetings.filter(m => {
        const meetingMonth = m.date.substring(0, 7);
        return meetingMonth === monthStr;
      }).length;
      
      months.push({
        month: monthNames[5 - i],
        meetings: count,
      });
    }
    
    return months;
  }, []);

  // Recent Meetings (Last 5, sorted by date)
  const recentMeetings = useMemo(() => {
    return [...mockMeetings]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, []);

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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome to HCMUT Meeting Management</h1>
        <p className="text-muted-foreground">
          Manage your academic meetings, track progress, and collaborate with tutors.
        </p>
      </div>

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
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="bg-primary hover:bg-primary-dark text-white">
              <Calendar className="mr-2 h-4 w-4" />
              Book New Meeting
            </Button>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              View All Meetings
            </Button>
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              My Progress
            </Button>
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

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

