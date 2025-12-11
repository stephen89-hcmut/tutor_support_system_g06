import React, { useEffect, useState } from 'react';
import {
  Avatar,
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
  Divider,
  Drawer,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Radio,
  RadioGroup,
  Slider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Calendar, Video, MapPin, User as UserIcon, Edit3, Play, Square, Plus, AlertTriangle } from 'lucide-react';
import { meetingService } from '@/application/services/meetingService';
import { meetingFeedbackService } from '@/application/services/meetingFeedbackService';
import type { Meeting, MeetingStatus } from '@/domain/entities/meeting';
import { useRole } from '@/contexts/RoleContext';
import { subjectService } from '@/application/services/subjectService';
import type { Subject } from '@/domain/entities/subject';

interface MeetingsPageProps {
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
    case 'Open':
      return 'Open';
    case 'Full':
      return 'Full';
    case 'Confirmed':
    case 'Scheduled':
      return 'Upcoming';
    case 'In Progress':
      return 'In Progress';
    case 'Completed':
      return 'Completed';
    case 'Cancelled':
    default:
      return 'Cancelled';
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

const MeetingCard: React.FC<{ meeting: Meeting; onJoin: (m: Meeting) => void; onCancel: (m: Meeting) => void; role: string }>
  = ({ meeting, onJoin, onCancel, role }) => {
    const formattedDate = formatMeetingDate(meeting);
    const formattedTime = formatMeetingTime(meeting);
    const joinEnabled = canJoinNow(meeting) && (meeting.status === 'Scheduled' || meeting.status === 'In Progress' || meeting.status === 'Confirmed');
    const cancelDisabled = disableCancel(meeting);
    const occupancy = meeting.currentCount ?? (meeting as any).currentCount ?? 0;
    const capacity = meeting.maxCapacity ?? (meeting as any).maxCapacity ?? 10;
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
            <Typography variant="body2">{role === 'Tutor' ? meeting.studentName : meeting.tutorName}</Typography>
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
      <DialogTitle>Rate Tutor</DialogTitle>
      <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {meeting && (
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Typography variant="body2"><strong>Chủ đề:</strong> {meeting.topic}</Typography>
            <Typography variant="body2"><strong>Tutor:</strong> {meeting.tutorName}</Typography>
            <Typography variant="body2"><strong>Thời gian:</strong> {formatMeetingDate(meeting)} {formatMeetingTime(meeting)}</Typography>
          </Box>
        )}
        <Typography variant="body2" gutterBottom>Chọn sao (1-5)</Typography>
        <Slider value={rating} min={1} max={5} step={1} marks onChange={(_, v) => setRating(v as number)} />
        <TextField
          label="Nhận xét"
          fullWidth
          multiline
          rows={4}
          sx={{ mt: 2 }}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        {error && (
          <Typography variant="body2" color="error">{error}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" disabled={!canSubmit} onClick={() => onSubmit(rating, comment)}>
          {submitting ? 'Đang gửi...' : 'Gửi'}
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
      <DialogTitle>Hủy lịch</DialogTitle>
      <DialogContent>
        <TextField
          label="Lý do"
          fullWidth
          multiline
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button variant="contained" color="error" onClick={() => { onConfirm(reason); setReason(''); }}>Hủy lịch</Button>
      </DialogActions>
    </Dialog>
  );
};

const RecordProgressDialog: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const [understanding, setUnderstanding] = useState(7);
  const [practice, setPractice] = useState(7);
  const [attitude, setAttitude] = useState(8);
  const [comment, setComment] = useState('');
  const [note, setNote] = useState('');
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Ghi nhận tiến độ</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        <Box>
          <Typography variant="body2" gutterBottom>Mức độ hiểu bài</Typography>
          <Slider value={understanding} min={1} max={10} step={1} marks onChange={(_, v) => setUnderstanding(v as number)} />
        </Box>
        <Box>
          <Typography variant="body2" gutterBottom>Kỹ năng thực hành</Typography>
          <Slider value={practice} min={1} max={10} step={1} marks onChange={(_, v) => setPractice(v as number)} />
        </Box>
        <Box>
          <Typography variant="body2" gutterBottom>Thái độ</Typography>
          <Slider value={attitude} min={1} max={10} step={1} marks onChange={(_, v) => setAttitude(v as number)} />
        </Box>
        <TextField label="Nhận xét" multiline rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
        <TextField label="Private note" multiline rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button variant="contained" onClick={onClose}>Lưu</Button>
      </DialogActions>
    </Dialog>
  );
};

const TutorSlotDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onCreate: (payload: any) => void;
}> = ({ open, onClose, onCreate }) => {
  const [subject, setSubject] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [mode, setMode] = useState<'Zoom' | 'Teams' | 'In-Person'>('Zoom');
  const [link, setLink] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(10);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setSubjectsLoading(true);
    subjectService.list()
      .then((list) => {
        if (!mounted) return;
        setSubjects(list);
        if (!subject && list.length) setSubject(list[0].id);
      })
      .catch(() => {
        if (!mounted) return;
        setSubjects([]);
      })
      .finally(() => {
        if (mounted) setSubjectsLoading(false);
      });
    return () => { mounted = false; };
  }, [open, subject]);

  const minSlider = 6;
  const maxSlider = 15;

  const handleSubmit = () => {
    onCreate({ subject, date, startTime, endTime, mode, link, location, capacity });
    onClose();
  };

  const disableCreate = !subject || !date || !startTime || !endTime || (mode !== 'In-Person' && !link) || (mode === 'In-Person' && !location);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tạo lịch giảng dạy mới</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', p: 1.5, bgcolor: 'warning.light', color: 'warning.dark', borderRadius: 1 }}>
          <AlertTriangle size={18} />
          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
            Lưu ý: Bạn không thể hủy lịch này trong vòng 24h trước giờ học nếu đã có sinh viên đăng ký.
          </Typography>
        </Box>

        <TextField
          select
          fullWidth
          label="Môn học"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          SelectProps={{ native: false }}
          helperText={subjectsLoading ? 'Đang tải danh sách môn...' : ''}
        >
          {subjects.map((s) => (
            <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          type="date"
          label="Ngày học"
          InputLabelProps={{ shrink: true }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          fullWidth
          required
        />

        <Stack direction="row" spacing={2}>
          <TextField
            type="time"
            label="Giờ bắt đầu"
            InputLabelProps={{ shrink: true }}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            fullWidth
            required
          />
          <TextField
            type="time"
            label="Giờ kết thúc"
            InputLabelProps={{ shrink: true }}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            fullWidth
            required
          />
        </Stack>

        <Typography variant="subtitle2" sx={{ mt: 1 }}>Hình thức *</Typography>
        <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value as 'Zoom' | 'Teams' | 'In-Person')}>
          <FormControlLabel value="Zoom" control={<Radio />} label="Online" />
          <FormControlLabel value="In-Person" control={<Radio />} label="Offline" />
        </RadioGroup>

        {mode === 'In-Person' ? (
          <TextField
            label="Phòng / Địa điểm"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            fullWidth
            required
          />
        ) : (
          <TextField
            label="Link Meeting"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://meet.google.com/..."
            fullWidth
            required
            helperText="Link sẽ được gửi cho sinh viên sau khi đăng ký"
          />
        )}

        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2">Sĩ số tối đa: {capacity} sinh viên</Typography>
          <Slider
            value={capacity}
            min={minSlider}
            max={maxSlider}
            step={1}
            marks
            onChange={(_, v) => setCapacity(v as number)}
          />
          <Typography variant="caption" color="text.secondary">Khuyến nghị: 8-10 sinh viên cho hiệu quả tốt nhất</Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" disabled={disableCreate} onClick={handleSubmit}>Tạo lịch</Button>
      </DialogActions>
    </Dialog>
  );
};

const TutorDetailDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  onStart: () => void;
  onFinish: () => void;
  onCancel: () => void;
}> = ({ open, onClose, meeting, onStart, onFinish, onCancel }) => {
  const [recordOpen, setRecordOpen] = useState(false);
  if (!meeting) return null;
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 420 } }}>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">{meeting.topic}</Typography>
            <Typography variant="body2" color="text.secondary">{formatMeetingDate(meeting)} {formatMeetingTime(meeting)}</Typography>
          </Box>
          <MeetingStatusChip status={meeting.status} />
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" size="small" startIcon={<Play size={16} />} onClick={onStart}>Start</Button>
          <Button variant="outlined" size="small" startIcon={<Square size={16} />} onClick={onFinish}>Finish</Button>
          <Button variant="text" color="error" size="small" onClick={onCancel}>Cancel</Button>
        </Stack>

        <Divider />
        <Typography variant="subtitle2">Participants</Typography>
        <Typography variant="body2" color="text.secondary">(Chưa tải danh sách – placeholder)</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Attendance</TableCell>
              <TableCell>Progress</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={3}>
                <Typography variant="body2" color="text.secondary">No participants loaded.</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Divider />
        <Typography variant="subtitle2">Ghi nhận tiến độ</Typography>
        <Button variant="outlined" startIcon={<Edit3 size={16} />} onClick={() => setRecordOpen(true)}>Record Progress</Button>
      </Box>
      <RecordProgressDialog open={recordOpen} onClose={() => setRecordOpen(false)} />
    </Drawer>
  );
};

const StudentSchedule: React.FC<{
  meetings: Meeting[];
  onJoin: (m: Meeting) => void;
  onCancel: (m: Meeting) => void;
  onRateTutor: (meeting: Meeting, rating: number, comment: string) => Promise<void>;
}> = ({ meetings, onJoin, onCancel, onRateTutor }) => {
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');
  const upcoming = meetings.filter((m) => isUpcomingMeeting(m));
  const history = meetings.filter((m) => !isUpcomingMeeting(m));
  const [ratingTarget, setRatingTarget] = useState<Meeting | null>(null);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmitRating = async (rating: number, comment: string) => {
    if (!ratingTarget) return;
    setSubmittingRating(true);
    setSubmitError(null);
    try {
      await onRateTutor(ratingTarget, rating, comment);
      setRatingTarget(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể gửi đánh giá.';
      setSubmitError(message);
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v as 'upcoming' | 'history')} aria-label="schedule-tabs" sx={{ minHeight: 0 }}>
        <Tab label={`Upcoming (${upcoming.length})`} value="upcoming" />
        <Tab label={`History (${history.length})`} value="history" />
      </Tabs>

      {tab === 'upcoming' && (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {upcoming.map((m) => (
            <Grid xs={12} md={6} lg={4} key={m.id}>
              <MeetingCard meeting={m} onJoin={onJoin} onCancel={onCancel} role="Student" />
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
    </Box>
  );
};

const TutorSchedule: React.FC<{
  meetings: Meeting[];
  onStart: (m: Meeting) => void;
  onFinish: (m: Meeting) => void;
  onCancel: (m: Meeting) => void;
  onCreateSlot: (payload: any) => void;
}> = ({ meetings, onStart, onFinish, onCancel, onCreateSlot }) => {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [selected, setSelected] = useState<Meeting | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [slotOpen, setSlotOpen] = useState(false);

  const handleOpenDetail = (m: Meeting) => {
    setSelected(m);
    setDrawerOpen(true);
  };

  return (
    <Box>
      <Toolbar disableGutters sx={{ justifyContent: 'space-between', mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant={view === 'list' ? 'contained' : 'outlined'} onClick={() => setView('list')}>List View</Button>
          <Button variant={view === 'calendar' ? 'contained' : 'outlined'} onClick={() => setView('calendar')}>Calendar View</Button>
        </Stack>
        <Button startIcon={<Plus size={16} />} variant="contained" onClick={() => setSlotOpen(true)}>
          Open New Slot
        </Button>
      </Toolbar>

      {view === 'list' && (
        <Grid container spacing={2}>
          {meetings.map((m) => (
            <Grid xs={12} md={6} lg={4} key={m.id}>
              <Card variant="outlined" onClick={() => handleOpenDetail(m)} sx={{ cursor: 'pointer' }}>
                <CardHeader
                  title={m.topic}
                  subheader={`${formatMeetingDate(m)} ${formatMeetingTime(m)}`}
                  action={<MeetingStatusChip status={m.status} />}
                />
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                    {m.mode === 'In-Person' ? <MapPin size={16} /> : <Video size={16} />}
                    <Typography variant="body2">{m.mode === 'In-Person' ? m.location || 'Offline' : m.mode}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Typography variant="caption">Group</Typography>
                    <Box sx={{ flex: 1 }}>
                      {(() => {
                        const capacity = m.maxCapacity && m.maxCapacity > 0 ? m.maxCapacity : 1;
                        const progress = Math.min(100, ((m.currentCount ?? 0) / capacity) * 100);
                        return <LinearProgress variant="determinate" value={progress} />;
                      })()}
                    </Box>
                    <Typography variant="caption">{m.currentCount ?? 0}/{m.maxCapacity && m.maxCapacity > 0 ? m.maxCapacity : 1}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {meetings.length === 0 && (
            <Grid xs={12}>
              <Typography color="text.secondary">Chưa có lịch.</Typography>
            </Grid>
          )}
        </Grid>
      )}

      {view === 'calendar' && (
        <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">Calendar view placeholder</Typography>
        </Box>
      )}

      <TutorDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        meeting={selected}
        onStart={() => selected && onStart(selected)}
        onFinish={() => selected && onFinish(selected)}
        onCancel={() => selected && onCancel(selected)}
      />

      <TutorSlotDialog
        open={slotOpen}
        onClose={() => setSlotOpen(false)}
        onCreate={onCreateSlot}
      />
    </Box>
  );
};

export function MeetingsPage({ onCancel, onBookNewMeeting }: MeetingsPageProps) {
  const { role, userId } = useRole();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Meeting | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        let data: Meeting[] = [];
        if (role === 'Student' && userId) data = await meetingService.getByStudent(userId);
        else if (role === 'Tutor' && userId) data = await meetingService.getByTutor(userId);
        else data = await meetingService.getAll();
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
  }, [role, userId]);

  const handleJoin = (m: Meeting) => {
    if (role === 'Student' && userId && m.studentId !== userId) return;
    if (role === 'Tutor' && userId && m.tutorId !== userId) return;
    if (m.mode !== 'In-Person' && m.link) window.open(m.link, '_blank');
    if (m.mode === 'In-Person' && m.location) alert(`Địa điểm: ${m.location}`);
  };

  const handleCancelComplete = (reason: string) => {
    if (!cancelTarget) return;
    onCancel(cancelTarget.id, role || 'Unknown', reason);
    setMeetings((prev) => prev.map((x) => x.id === cancelTarget.id ? { ...x, status: 'Cancelled' as MeetingStatus } : x));
    setCancelTarget(null);
  };

  const handleStart = (m: Meeting) => {
    setMeetings((prev) => prev.map((x) => x.id === m.id ? { ...x, status: 'In Progress' as MeetingStatus } : x));
  };

  const handleFinish = (m: Meeting) => {
    setMeetings((prev) => prev.map((x) => x.id === m.id ? { ...x, status: 'Completed' as MeetingStatus } : x));
  };

  const handleRateTutor = async (meeting: Meeting, rating: number, comment: string) => {
    if (!userId) throw new Error('Bạn cần đăng nhập để đánh giá');

    if (meeting.studentRating) {
      throw new Error('Bạn đã đánh giá buổi học này.');
    }

    const existing = await meetingFeedbackService.getFeedbackByMeeting(meeting.id);
    if (existing) {
      setMeetings((prev) => prev.map((m) =>
        m.id === meeting.id
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
      meetingId: meeting.id,
      studentId: userId,
      tutorId: meeting.tutorId,
      rating,
      comment,
    });

    const submittedAt = new Date().toISOString();
    setMeetings((prev) => prev.map((m) =>
      m.id === meeting.id
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
  };

  const handleCreateSlot = (payload: any) => {
    const now = new Date();
    const id = `slot-${now.getTime()}`;
    const startIso = payload.date && payload.startTime ? new Date(`${payload.date}T${payload.startTime}:00`).toISOString() : now.toISOString();
    const newMeeting: Meeting = {
      id,
      date: payload.date || now.toISOString().slice(0, 10),
      time: startIso,
      topic: payload.subject || 'New Slot',
      tutorId: userId || 'tutor',
      tutorName: 'You',
      studentId: '',
      studentName: '',
      mode: payload.mode,
      location: payload.mode === 'In-Person' ? payload.location : undefined,
      link: payload.mode !== 'In-Person' ? payload.link : undefined,
      status: 'Scheduled',
      currentCount: 0,
      maxCapacity: payload.capacity ?? 10,
    };
    setMeetings((prev) => [newMeeting, ...prev]);
  };

  if (loading) return <Typography sx={{ p: 3 }}>Đang tải...</Typography>;
  if (error) return <Typography sx={{ p: 3, color: 'error.main' }}>{error}</Typography>;

  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">{role === 'Tutor' ? 'Teaching Schedule' : 'My Schedule'}</Typography>
        {role === 'Student' && (
          <Button variant="contained" onClick={onBookNewMeeting}>Book Meeting</Button>
        )}
      </Stack>

      {role === 'Tutor' ? (
        <TutorSchedule
          meetings={meetings}
          onStart={handleStart}
          onFinish={handleFinish}
          onCancel={(m) => setCancelTarget(m)}
          onCreateSlot={handleCreateSlot}
        />
      ) : (
        <StudentSchedule
          meetings={meetings}
          onJoin={handleJoin}
          onCancel={(m) => setCancelTarget(m)}
          onRateTutor={handleRateTutor}
        />
      )}

      <CancelDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelComplete}
      />
    </Box>
  );
}

