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
  Grid,
  LinearProgress,
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
import { Calendar, Video, MapPin, User as UserIcon, Edit3, Play, Square, Plus } from 'lucide-react';
import { meetingService } from '@/application/services/meetingService';
import type { Meeting, MeetingStatus } from '@/domain/entities/meeting';
import { useRole } from '@/contexts/RoleContext';

interface MeetingsPageProps {
  onCancel: (meetingId: string, cancelledBy: string, reason: string) => void;
  onBookNewMeeting: () => void;
}

const statusChipColor: Record<MeetingStatus, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  Scheduled: 'warning',
  'In Progress': 'info',
  Completed: 'success',
  Cancelled: 'default',
};

const statusLabel = (status: MeetingStatus) => {
  switch (status) {
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

const canJoinNow = (meeting: Meeting) => {
  const start = meeting.date && meeting.time ? new Date(`${meeting.date}T${meeting.time}`) : null;
  if (!start || isNaN(start.getTime())) return false;
  const now = new Date();
  const diffMinutes = (start.getTime() - now.getTime()) / (1000 * 60);
  return diffMinutes <= 15 && diffMinutes >= -180;
};

const disableCancel = (meeting: Meeting) => {
  const start = meeting.date && meeting.time ? new Date(`${meeting.date}T${meeting.time}`) : null;
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
    const start = meeting.time ? new Date(meeting.time) : meeting.date ? new Date(meeting.date) : null;
    const formattedDate = start ? start.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }) : meeting.date;
    const formattedTime = start ? start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : meeting.time;
    const joinEnabled = canJoinNow(meeting) && (meeting.status === 'Scheduled' || meeting.status === 'In Progress');
    const cancelDisabled = disableCancel(meeting);
    const occupancy = (meeting as any).currentCount ?? 0;
    const capacity = (meeting as any).maxCapacity ?? 10;

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
              <LinearProgress variant="determinate" value={Math.min(100, (occupancy / capacity) * 100)} />
            </Box>
            <Typography variant="caption">{occupancy}/{capacity}</Typography>
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
  onSubmit: (rating: number, comment: string) => void;
}> = ({ open, onClose, onSubmit }) => {
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState('');
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Rate Tutor</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={() => { onSubmit(rating, comment); onClose(); }}>Gửi</Button>
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
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [mode, setMode] = useState<'Zoom' | 'Teams' | 'In-Person'>('Zoom');
  const [link, setLink] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(8);
  const [type, setType] = useState<'1-1' | 'Group'>('Group');

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tạo slot mới</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        <TextField label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} fullWidth />
        <Stack direction="row" spacing={2}>
          <TextField type="date" label="Date" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} fullWidth />
          <TextField type="time" label="Time" InputLabelProps={{ shrink: true }} value={startTime} onChange={(e) => setStartTime(e.target.value)} fullWidth />
        </Stack>
        <RadioGroup row value={type} onChange={(e) => setType(e.target.value as '1-1' | 'Group')}>
          <FormControlLabel value="1-1" control={<Radio />} label="1-1" />
          <FormControlLabel value="Group" control={<Radio />} label="Group" />
        </RadioGroup>
        <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value as 'Zoom' | 'Teams' | 'In-Person')}>
          <FormControlLabel value="Zoom" control={<Radio />} label="Zoom" />
          <FormControlLabel value="Teams" control={<Radio />} label="Teams" />
          <FormControlLabel value="In-Person" control={<Radio />} label="Offline" />
        </RadioGroup>
        {mode === 'In-Person' ? (
          <TextField label="Phòng" value={location} onChange={(e) => setLocation(e.target.value)} fullWidth />
        ) : (
          <TextField label="Link" value={link} onChange={(e) => setLink(e.target.value)} fullWidth />
        )}
        <Box>
          <Typography variant="body2" gutterBottom>Capacity</Typography>
          <Slider value={capacity} min={6} max={12} step={1} marks onChange={(_, v) => setCapacity(v as number)} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button variant="contained" onClick={() => {
          onCreate({ subject, date, startTime, mode, link, location, capacity, type });
          onClose();
        }}>Tạo</Button>
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
            <Typography variant="body2" color="text.secondary">{meeting.date} {meeting.time}</Typography>
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
}> = ({ meetings, onJoin, onCancel }) => {
  const upcoming = meetings.filter((m) => m.status !== 'Completed' && m.status !== 'Cancelled');
  const history = meetings.filter((m) => m.status === 'Completed' || m.status === 'Cancelled');
  const [ratingTarget, setRatingTarget] = useState<Meeting | null>(null);

  return (
    <Box>
      <Tabs value="upcoming" aria-label="schedule-tabs" sx={{ minHeight: 0 }}>
        <Tab label={`Upcoming (${upcoming.length})`} value="upcoming" />
        <Tab label={`History (${history.length})`} value="history" disabled />
      </Tabs>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {upcoming.map((m) => (
          <Grid item xs={12} md={6} lg={4} key={m.id}>
            <MeetingCard meeting={m} onJoin={onJoin} onCancel={onCancel} role="Student" />
          </Grid>
        ))}
        {upcoming.length === 0 && (
          <Grid item xs={12}>
            <Typography color="text.secondary">Không có buổi sắp tới.</Typography>
          </Grid>
        )}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>History</Typography>
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
                <TableCell>{m.date} {m.time}</TableCell>
                <TableCell>{m.topic}</TableCell>
                <TableCell>{m.tutorName}</TableCell>
                <TableCell><MeetingStatusChip status={m.status} /></TableCell>
                <TableCell align="right">
                  {m.status === 'Completed' && !m.studentRating && (
                    <Button size="small" color="warning" onClick={() => setRatingTarget(m)}>Rate Tutor</Button>
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

      <RatingDialog
        open={!!ratingTarget}
        onClose={() => setRatingTarget(null)}
        onSubmit={() => setRatingTarget(null)}
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
            <Grid item xs={12} md={6} lg={4} key={m.id}>
              <Card variant="outlined" onClick={() => handleOpenDetail(m)} sx={{ cursor: 'pointer' }}>
                <CardHeader
                  title={m.topic}
                  subheader={`${m.date} ${m.time}`}
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
                      <LinearProgress variant="determinate" value={Math.min(100, (((m as any).currentCount ?? 0) / ((m as any).maxCapacity ?? 10)) * 100)} />
                    </Box>
                    <Typography variant="caption">{(m as any).currentCount ?? 0}/{(m as any).maxCapacity ?? 10}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {meetings.length === 0 && (
            <Grid item xs={12}>
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

