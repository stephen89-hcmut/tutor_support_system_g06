import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Grid,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { format, parseISO, subMonths } from 'date-fns';
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { progressService } from '@/application/services/progressService';
import type { ProgressRecord, ProgressStats } from '@/types/progress';
import { authService } from '@/application/services/authService';
import { useRole } from '@/contexts/RoleContext';

const getAttendanceColor = (value: number) => {
  if (value > 90) return '#22c55e';
  if (value >= 80) return '#f59e0b';
  return '#ef4444';
};

const ScoreBars = ({ scores }: { scores: ProgressRecord['scores'] }) => (
  <Stack spacing={1}>
    {[
      { label: 'Understanding', value: scores.understanding, color: '#0ea5e9' },
      { label: 'Practice', value: scores.practice, color: '#f97316' },
      { label: 'Engagement', value: scores.engagement, color: '#22c55e' },
    ].map((item) => (
      <Box key={item.label}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            {item.label}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {item.value.toFixed(1)} / 10
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={item.value * 10}
          sx={{
            height: 8,
            borderRadius: 6,
            backgroundColor: '#e5e7eb',
            '& .MuiLinearProgress-bar': { backgroundColor: item.color },
          }}
        />
      </Box>
    ))}
  </Stack>
);

const TrendTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: 'white', p: 1.5, borderRadius: 1, boxShadow: 3, border: '1px solid #e5e7eb' }}>
      <Typography variant="body2" fontWeight={700}>
        {format(parseISO(label), 'PPP')}
      </Typography>
      {payload.map((p: any) => (
        <Typography key={p.dataKey} variant="body2" color={p.color}>
          {p.name}: {p.value.toFixed(1)}
        </Typography>
      ))}
    </Box>
  );
};

const EmptyState = ({ onFindTutor }: { onFindTutor: () => void }) => (
  <Card sx={{ textAlign: 'center', py: 6 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Không có dữ liệu tiến độ
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Hãy đặt lịch với gia sư để bắt đầu theo dõi tiến độ học tập của bạn.
      </Typography>
      <Button variant="contained" onClick={onFindTutor}>
        Tìm gia sư
      </Button>
    </CardContent>
  </Card>
);

const computeStats = (records: ProgressRecord[]): ProgressStats => {
  if (!records.length) {
    return { attendanceRate: 0, avgScore: 0, avgScoreTrend: 0, totalHours: 0 };
  }

  const attendanceRate =
    (records.filter((r) => r.attendance === 'Present').length / records.length) * 100;

  const avgScores = records.map((r) =>
    (r.scores.understanding + r.scores.practice + r.scores.engagement) / 3,
  );
  const avgScore = avgScores.reduce((a, b) => a + b, 0) / avgScores.length;

  const now = new Date();
  const lastMonth = subMonths(now, 1);
  const currentMonthScores = records
    .filter((r) => parseISO(r.date).getMonth() === now.getMonth())
    .map((r) => (r.scores.understanding + r.scores.practice + r.scores.engagement) / 3);
  const lastMonthScores = records
    .filter((r) => parseISO(r.date).getMonth() === lastMonth.getMonth())
    .map((r) => (r.scores.understanding + r.scores.practice + r.scores.engagement) / 3);
  const avgCurrent = currentMonthScores.length
    ? currentMonthScores.reduce((a, b) => a + b, 0) / currentMonthScores.length
    : avgScore;
  const avgPrevious = lastMonthScores.length
    ? lastMonthScores.reduce((a, b) => a + b, 0) / lastMonthScores.length
    : avgScore;
  const avgScoreTrend = parseFloat((avgCurrent - avgPrevious).toFixed(1));

  const HOURS_PER_SESSION = 1.5;
  const totalHours = parseFloat((records.length * HOURS_PER_SESSION).toFixed(1));

  return {
    attendanceRate: parseFloat(attendanceRate.toFixed(1)),
    avgScore: parseFloat(avgScore.toFixed(1)),
    avgScoreTrend,
    totalHours,
  };
};

export function StudentProgressPage() {
  const { userId } = useRole();
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<string>('All Subjects');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const session = authService.getSession();
        const studentId = userId || session?.userId;
        if (!studentId) {
          throw new Error('Bạn cần đăng nhập để xem tiến độ.');
        }
        const data = await progressService.getForStudent(studentId);
        if (!mounted) return;
        setRecords(data);
      } catch (err) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : 'Không thể tải dữ liệu tiến độ.';
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const subjects = useMemo(() => {
    const unique = Array.from(new Set(records.map((r) => r.subject)));
    return ['All Subjects', ...unique];
  }, [records]);

  const filtered = useMemo(
    () => records.filter((r) => subjectFilter === 'All Subjects' || r.subject === subjectFilter),
    [records, subjectFilter],
  );

  const stats = useMemo(() => computeStats(filtered), [filtered]);

  const trendData = useMemo(
    () =>
      filtered
        .slice()
        .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
        .map((r) => ({
          date: r.date,
          Understanding: r.scores.understanding,
          Practice: r.scores.practice,
        })),
    [filtered],
  );

  const radarData = useMemo(() => {
    if (!filtered.length) return [] as { skill: string; value: number }[];
    const sums = filtered.reduce(
      (acc, r) => ({
        understanding: acc.understanding + r.scores.understanding,
        practice: acc.practice + r.scores.practice,
        engagement: acc.engagement + r.scores.engagement,
      }),
      { understanding: 0, practice: 0, engagement: 0 },
    );
    return [
      { skill: 'Understanding', value: parseFloat((sums.understanding / filtered.length).toFixed(1)) },
      { skill: 'Practice', value: parseFloat((sums.practice / filtered.length).toFixed(1)) },
      { skill: 'Engagement', value: parseFloat((sums.engagement / filtered.length).toFixed(1)) },
    ];
  }, [filtered]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: 'center' }}>
        <Typography>Đang tải tiến độ...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        mb={3}
      >
        <Typography variant="h5" fontWeight={700}>
          Tiến độ học tập
        </Typography>
        <Autocomplete
          sx={{ minWidth: 260 }}
          options={subjects}
          value={subjectFilter}
          onChange={(_, value) => setSubjectFilter(value ?? 'All Subjects')}
          renderInput={(params) => <TextField {...params} label="Lọc theo môn" />}
        />
      </Stack>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box position="relative" display="inline-flex">
                  <CircularProgress
                    variant="determinate"
                    value={stats.attendanceRate}
                    size={72}
                    thickness={5}
                    sx={{ color: getAttendanceColor(stats.attendanceRate) }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700}>
                      {stats.attendanceRate.toFixed(0)}%
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Attendance
                  </Typography>
                  <Typography variant="h6">Tỉ lệ hiện diện</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                {stats.avgScoreTrend >= 0 ? (
                  <TrendingUpIcon color="success" fontSize="large" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="large" />
                )}
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Điểm trung bình
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6">{stats.avgScore.toFixed(1)} / 10</Typography>
                    <Chip
                      size="small"
                      color={stats.avgScoreTrend >= 0 ? 'success' : 'error'}
                      label={`${stats.avgScoreTrend >= 0 ? '+' : ''}${stats.avgScoreTrend}`}
                    />
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <AccessTimeIcon color="action" fontSize="large" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tổng giờ học
                  </Typography>
                  <Typography variant="h6">{stats.totalHours.toFixed(1)} giờ</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Xu hướng học tập" subheader="Understanding vs Practice" />
            <CardContent sx={{ height: 320 }}>
              {trendData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(d) => format(parseISO(d), 'MM/dd')} minTickGap={20} />
                    <YAxis domain={[0, 10]} />
                    <Tooltip content={<TrendTooltip />} />
                    <Line type="monotone" dataKey="Understanding" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Practice" stroke="#f97316" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary">Không có dữ liệu biểu đồ</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Phân bố kỹ năng" subheader="Điểm trung bình từng kỹ năng" />
            <CardContent sx={{ height: 320 }}>
              {radarData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis domain={[0, 10]} />
                    <Radar name="Skills" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary">Không có dữ liệu biểu đồ</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>
        Lịch sử buổi học
      </Typography>
      {!filtered.length ? (
        <EmptyState onFindTutor={() => window.alert('Đi tới trang tìm gia sư')} />
      ) : (
        <Stack spacing={2}>
          {filtered.map((r) => (
            <Card key={r.id} variant="outlined">
              <CardContent>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  spacing={2}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={r.tutorAvatar || undefined} alt={r.tutorName} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {r.subject}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(parseISO(r.date), 'PPP')} · Tutor: {r.tutorName}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    label={r.attendance === 'Present' ? 'Có mặt' : 'Vắng'}
                    color={r.attendance === 'Present' ? 'success' : 'error'}
                    variant="outlined"
                  />
                </Stack>

                <Box mt={2} />
                <ScoreBars scores={r.scores} />

                <Box mt={2}>
                  <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Nhận xét của tutor
                    </Typography>
                    <Typography variant="body1">“{r.comment || 'Không có nhận xét'}”</Typography>
                  </Box>
                </Box>

                <Stack direction="row" spacing={1.5} mt={2}>
                  <Button variant="outlined" size="small" disabled={!r.hasMaterials}>
                    Tài liệu buổi học
                  </Button>
                  {!r.isTutorRated && (
                    <Button variant="contained" color="secondary" size="small">
                      Đánh giá tutor
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
