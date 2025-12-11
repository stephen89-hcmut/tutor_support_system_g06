import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  Slider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Calendar, Video, MapPin, User as UserIcon } from 'lucide-react';
import { meetingService } from '@/application/services/meetingService';
import { meetingFeedbackService } from '@/application/services/meetingFeedbackService';
import type { Meeting, MeetingStatus } from '@/domain/entities/meeting';
import { useRole } from '@/contexts/RoleContext';

interface StudentMeetingPageProps {
  onCancel: (meetingId: string, cancelledBy: string, reason: string) => void;
  onBookNewMeeting: () => void;
}

const statusChipColor: Record<MeetingStatus, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  Open: 'primary',
  Full: 'secondary',
  Confirmed: 'warning',
  Scheduled: 'warning',
  'In Progress': 'info',
  Completed: 'success',
  Cancelled: 'default',
};

const statusLabel = (status: MeetingStatus) => {
  switch (status) {
    case 'Open': return 'Open';
    case 'Full': return 'Full';
    case 'Confirmed':
    case 'Scheduled': return 'Upcoming';
    case 'In Progress': return 'In Progress';
    case 'Completed': return 'Completed';
    case 'Cancelled':
    default: return 'Cancelled';
  }
};

const getMeetingStart = (meeting: Meeting) => {
  if (meeting.time) {
    const parsed = new Date(meeting.time);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  if (meeting.date) {
    const parsed = new Date(meeting.date);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return null;
};

const formatMeetingDate = (meeting: Meeting) => {
  const start = getMeetingStart(meeting);
  return start ? start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : meeting.date;
};

const formatMeetingTime = (meeting: Meeting) => {
  const start = getMeetingStart(meeting);
  return start ? start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : meeting.time;
};

const isUpcomingMeeting = (meeting: Meeting) => {
  if (meeting.status === 'Completed' || meeting.status === 'Cancelled') return false;
  const upcomingStatuses: MeetingStatus[] = ['Scheduled', 'Confirmed', 'In Progress', 'Open', 'Full'];
  const start = getMeetingStart(meeting);
  const statusUpcoming = upcomingStatuses.includes(meeting.status);
  if (!start) return statusUpcoming;
  return statusUpcoming && start.getTime() >= Date.now() - 3 * 60 * 60 * 1000;
};

const canJoinNow = (meeting: Meeting) => {
  const start = getMeetingStart(meeting);
  if (!start || isNaN(start.getTime())) return false;
  const now = new Date();
  const diffMinutes = (start.getTime() - now.getTime()) / (1000 * 60);
  return diffMinutes <= 15 && diffMinutes >= -180;
};

const disableCancel = (meeting: Meeting) => {
  const start = getMeetingStart(meeting);
  if (!start || isNaN(start.getTime())) return false;
  const now = new Date();
  const diffHours = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffHours < 24;
};

const MeetingStatusChip: React.FC<{ status: MeetingStatus }> = ({ status }) => (
  <Chip label={statusLabel(status)} color={statusChipColor[status]} size="small" />
);

const MeetingCard: React.FC<{ meeting: Meeting; onJoin: (m: Meeting) => void; onCancel: (m: Meeting) => void }>
  = ({ meeting, onJoin, onCancel }) => {
    const formattedDate = formatMeetingDate(meeting);
    const formattedTime = formatMeetingTime(meeting);
    const joinEnabled = canJoinNow(meeting) && (meeting.status === 'Scheduled' || meeting.status === 'In Progress' || meeting.status === 'Confirmed');
    const cancelDisabled = disableCancel(meeting);
    const occupancy = meeting.currentCount ?? 0;
    const capacity = meeting.maxCapacity ?? 10;
    const safeCapacity = capacity > 0 ? capacity : 1;

    return (
      <Card variant="outlined" sx={{ height: '100%' }}>
        <CardHeader
          title={<Typography variant="subtitle2" color="text.secondary">{formattedDate}</Typography>}
          subheader={<Typography variant="body2">{formattedTime}</Typography>}
          action={<MeetingStatusChip status={meeting.status} />}
        />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="h6">{meeting.topic}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ width: 28, height: 28 }}>
              <UserIcon size={16} />
            </Avatar>
            <Typography variant="body2">{meeting.tutorName}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
            {meeting.mode === 'In-Person' ? <MapPin size={16} /> : <Video size={16} />}
            <Typography variant="body2">{meeting.mode === 'In-Person' ? meeting.location || 'Offline' : meeting.mode}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption">Group</Typography>
            <Box sx={{ flex: 1 }}>
              <LinearProgress variant="determinate" value={Math.min(100, (occupancy / safeCapacity) * 100)} />
            </Box>
            <Typography variant="caption">{occupancy}/{safeCapacity}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button
              variant="contained"
              size="small"
              disabled={!joinEnabled}
              onClick={() => onJoin(meeting)}
            >
              Join Meeting
            </Button>
            <Button
              variant="outlined"
              size="small"
              disabled={cancelDisabled}
              onClick={() => onCancel(meeting)}
            >
              Cancel
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  };

const RatingDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  meeting?: Meeting | null;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}> = ({ open, onClose, meeting, submitting = false, error, onSubmit }) => {
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState('');
  const canSubmit = rating >= 1 && rating <= 5 && comment.trim().length > 0 && !submitting;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Đánh giá Tutor</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        {meeting && (
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">Meeting</Typography>
            <Typography variant="body1" fontWeight="medium">{meeting.topic}</Typography>
            <Typography variant="body2" color="text.secondary">{meeting.tutorName}</Typography>
          </Box>
        )}
        <Box>
          <Typography variant="body2" gutterBottom>Rating (1-5)</Typography>
          <Slider value={rating} min={1} max={5} step={1} marks onChange={(_, v) => setRating(v as number)} />
        </Box>
        <TextField
          label="Comment"
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          helperText="Chia sẻ trải nghiệm của bạn"
        />
        {error && <Typography color="error" variant="body2">{error}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Hủy</Button>
        <Button variant="contained" onClick={() => onSubmit(rating, comment)} disabled={!canSubmit}>
          {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CancelDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}> = ({ open, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Hủy buổi học</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <TextField
          label="Lý do hủy"
          multiline
          rows={3}
          fullWidth
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button variant="contained" color="error" onClick={() => onConfirm(reason)} disabled={!reason.trim()}>
          Xác nhận hủy
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export function StudentMeetingPage({ onCancel, onBookNewMeeting }: StudentMeetingPageProps) {
  const { userId } = useRole();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Meeting | null>(null);
  const [ratingTarget, setRatingTarget] = useState<Meeting | null>(null);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = userId ? await meetingService.getByStudent(userId) : await meetingService.getAll();
        if (!mounted) return;
        setMeetings(data);
      } catch (err) {
        if (!mounted) return;
        setError('Không thể tải danh sách buổi học.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [userId]);

  const handleJoin = (m: Meeting) => {
    if (userId && m.studentId !== userId) return;
    if (m.mode !== 'In-Person' && m.link) window.open(m.link, '_blank');
    if (m.mode === 'In-Person' && m.location) alert(`Địa điểm: ${m.location}`);
  };

  const handleCancelComplete = (reason: string) => {
    if (!cancelTarget) return;
    onCancel(cancelTarget.id, 'Student', reason);
    setMeetings((prev) => prev.map((x) => x.id === cancelTarget.id ? { ...x, status: 'Cancelled' as MeetingStatus } : x));
    setCancelTarget(null);
  };

  const handleSubmitRating = async (rating: number, comment: string) => {
    if (!ratingTarget || !userId) return;
    setSubmittingRating(true);
    setSubmitError(null);
    try {
      if (ratingTarget.studentRating) {
        throw new Error('Bạn đã đánh giá buổi học này.');
      }

      const existing = await meetingFeedbackService.getFeedbackByMeeting(ratingTarget.id);
      if (existing) {
        setMeetings((prev) => prev.map((m) =>
          m.id === ratingTarget.id
            ? {
                ...m,
                studentRating: {
                  knowledge: existing.rating,
                  communication: existing.rating,
                  helpfulness: existing.rating,
                  punctuality: existing.rating,
                  comment: existing.comment,
                  submittedAt: existing.createdAt,
                },
              }
            : m,
        ));
        throw new Error('Bạn đã đánh giá buổi học này.');
      }

      await meetingFeedbackService.submitFeedback({
        meetingId: ratingTarget.id,
        studentId: userId,
        tutorId: ratingTarget.tutorId,
        rating,
        comment,
      });

      const submittedAt = new Date().toISOString();
      setMeetings((prev) => prev.map((m) =>
        m.id === ratingTarget.id
          ? {
              ...m,
              studentRating: {
                knowledge: rating,
                communication: rating,
                helpfulness: rating,
                punctuality: rating,
                comment,
                submittedAt,
              },
            }
          : m,
      ));
      setRatingTarget(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể gửi đánh giá.';
      setSubmitError(message);
    } finally {
      setSubmittingRating(false);
    }
  };

  const upcoming = meetings.filter((m) => isUpcomingMeeting(m));
  const history = meetings.filter((m) => !isUpcomingMeeting(m));

  if (loading) return <Typography sx={{ p: 3 }}>Đang tải...</Typography>;
  if (error) return <Typography sx={{ p: 3, color: 'error.main' }}>{error}</Typography>;

  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">My Schedule</Typography>
        <Button variant="contained" onClick={onBookNewMeeting}>Book Meeting</Button>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v as 'upcoming' | 'history')} aria-label="schedule-tabs" sx={{ minHeight: 0 }}>
        <Tab label={`Upcoming (${upcoming.length})`} value="upcoming" />
        <Tab label={`History (${history.length})`} value="history" />
      </Tabs>

      {tab === 'upcoming' && (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {upcoming.map((m) => (
            <Grid xs={12} md={6} lg={4} key={m.id}>
              <MeetingCard meeting={m} onJoin={handleJoin} onCancel={(m) => setCancelTarget(m)} />
            </Grid>
          ))}
          {upcoming.length === 0 && (
            <Grid xs={12}>
              <Typography color="text.secondary">Không có buổi sắp tới.</Typography>
            </Grid>
          )}
        </Grid>
      )}

      {tab === 'history' && (
        <Box sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Thời gian</TableCell>
                <TableCell>Môn</TableCell>
                <TableCell>Tutor</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{formatMeetingDate(m)} {formatMeetingTime(m)}</TableCell>
                  <TableCell>{m.topic}</TableCell>
                  <TableCell>{m.tutorName}</TableCell>
                  <TableCell><MeetingStatusChip status={m.status} /></TableCell>
                  <TableCell align="right">
                    {m.status === 'Completed' && !m.studentRating && (
                      <Button size="small" color="warning" onClick={() => setRatingTarget(m)}>Rate Tutor</Button>
                    )}
                    {m.studentRating && (
                      <Chip label="Rated" color="success" size="small" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="text.secondary">Chưa có lịch sử.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      )}

      <RatingDialog
        open={!!ratingTarget}
        meeting={ratingTarget}
        submitting={submittingRating}
        error={submitError}
        onClose={() => setRatingTarget(null)}
        onSubmit={handleSubmitRating}
      />

      <CancelDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelComplete}
      />
    </Box>
  );
}
