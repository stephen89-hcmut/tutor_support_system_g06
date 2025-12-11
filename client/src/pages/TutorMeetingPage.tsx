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
  Drawer,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Radio,
  RadioGroup,
  Slider,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Video, MapPin, Plus, AlertTriangle, Square, Play } from 'lucide-react';
import { meetingService } from '@/application/services/meetingService';
import type { Meeting, MeetingStatus } from '@/domain/entities/meeting';
import { useRole } from '@/contexts/RoleContext';
import { subjectService } from '@/application/services/subjectService';
import type { Subject } from '@/domain/entities/subject';

interface TutorMeetingPageProps {
  onCancel: (meetingId: string, cancelledBy: string, reason: string) => void;
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

const MeetingStatusChip: React.FC<{ status: MeetingStatus }> = ({ status }) => (
  <Chip label={statusLabel(status)} color={statusChipColor[status]} size="small" />
);

const TutorSlotDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onCreate: (payload: any) => Promise<void>;
  tutorId: string;
}> = ({ open, onClose, onCreate, tutorId }) => {
  const [subject, setSubject] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [mode, setMode] = useState<'Zoom' | 'Teams' | 'In-Person'>('Zoom');
  const [link, setLink] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(8);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const maxSlider = 10;

  const handleSubmit = async () => {
    if (creating) return;
    setError(null);
    setCreating(true);
    try {
      // Kiểm tra trùng lịch
      const startDateTime = `${date}T${startTime}:00`;
      const endDateTime = `${date}T${endTime}:00`;
      const tutorMeetings = await meetingService.getByTutor(tutorId);
      
      const hasConflict = tutorMeetings.some((meeting) => {
        if (meeting.status === 'Cancelled' || meeting.status === 'Completed') return false;
        const meetingStart = getMeetingStart(meeting);
        if (!meetingStart) return false;
        const newStart = new Date(startDateTime);
        const newEnd = new Date(endDateTime);
        const meetingDate = new Date(meeting.date);
        // Kiểm tra cùng ngày và thời gian overlap
        if (meetingDate.toDateString() !== newStart.toDateString()) return false;
        // Giả sử meeting có duration 2h nếu không có endTime
        const meetingEnd = new Date(meetingStart.getTime() + 2 * 60 * 60 * 1000);
        return (newStart < meetingEnd && newEnd > meetingStart);
      });

      if (hasConflict) {
        setError('Bạn đã có lịch trùng vào thời gian này!');
        return;
      }

      await onCreate({ subject, date, startTime, endTime, mode, link, location, capacity });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tạo lịch';
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  const disableCreate = creating || !subject || !date || !startTime || !endTime || (mode !== 'In-Person' && !link) || (mode === 'In-Person' && !location);

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

        {error && (
          <Box sx={{ p: 1.5, bgcolor: 'error.light', color: 'error.dark', borderRadius: 1, mt: 1 }}>
            <Typography variant="body2">{error}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={creating}>Hủy</Button>
        <Button variant="contained" disabled={disableCreate} onClick={handleSubmit}>
          {creating ? 'Đang tạo...' : 'Tạo lịch'}
        </Button>
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
  if (!meeting) return null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, p: 3 }}>
        <Typography variant="h6" gutterBottom>Chi tiết buổi học</Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Môn học</Typography>
            <Typography variant="body1">{meeting.topic}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Thời gian</Typography>
            <Typography variant="body1">{formatMeetingDate(meeting)} {formatMeetingTime(meeting)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Hình thức</Typography>
            <Typography variant="body1">{meeting.mode === 'In-Person' ? 'Offline' : 'Online'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Địa điểm / Link</Typography>
            <Typography variant="body1">{meeting.mode === 'In-Person' ? meeting.location : meeting.link}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Sĩ số</Typography>
            <Typography variant="body1">{meeting.currentCount ?? 0} / {meeting.maxCapacity ?? 10}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Trạng thái</Typography>
            <Box sx={{ mt: 0.5 }}><MeetingStatusChip status={meeting.status} /></Box>
          </Box>

          <Stack spacing={1} sx={{ mt: 2 }}>
            {meeting.status === 'Scheduled' && (
              <Button variant="contained" startIcon={<Play size={16} />} onClick={onStart}>
                Bắt đầu
              </Button>
            )}
            {meeting.status === 'In Progress' && (
              <Button variant="contained" color="success" startIcon={<Square size={16} />} onClick={onFinish}>
                Kết thúc
              </Button>
            )}
            {meeting.status !== 'Completed' && meeting.status !== 'Cancelled' && (
              <Button variant="outlined" color="error" onClick={onCancel}>
                Hủy buổi học
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
    </Drawer>
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

export function TutorMeetingPage({ onCancel }: TutorMeetingPageProps) {
  const { userId } = useRole();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [selected, setSelected] = useState<Meeting | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [slotOpen, setSlotOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Meeting | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = userId ? await meetingService.getByTutor(userId) : await meetingService.getAll();
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

  const handleOpenDetail = (m: Meeting) => {
    setSelected(m);
    setDrawerOpen(true);
  };

  const handleStart = () => {
    if (!selected) return;
    setMeetings((prev) => prev.map((x) => x.id === selected.id ? { ...x, status: 'In Progress' as MeetingStatus } : x));
    setDrawerOpen(false);
  };

  const handleFinish = () => {
    if (!selected) return;
    setMeetings((prev) => prev.map((x) => x.id === selected.id ? { ...x, status: 'Completed' as MeetingStatus } : x));
    setDrawerOpen(false);
  };

  const handleCancelComplete = (reason: string) => {
    if (!cancelTarget) return;
    onCancel(cancelTarget.id, 'Tutor', reason);
    setMeetings((prev) => prev.map((x) => x.id === cancelTarget.id ? { ...x, status: 'Cancelled' as MeetingStatus } : x));
    setCancelTarget(null);
    setDrawerOpen(false);
  };

  const handleCreateSlot = async (payload: any) => {
    if (!userId) throw new Error('Bạn cần đăng nhập để tạo lịch');
    
    const startIso = payload.date && payload.startTime ? new Date(`${payload.date}T${payload.startTime}:00`).toISOString() : new Date().toISOString();
    const endIso = payload.date && payload.endTime ? new Date(`${payload.date}T${payload.endTime}:00`).toISOString() : new Date().toISOString();
    
    // Tìm subject name từ subject ID
    const subjectList = await subjectService.list();
    const subjectObj = subjectList.find(s => s.id === payload.subject);
    const subjectName = subjectObj?.name || payload.subject;
    
    const newMeeting: Meeting = {
      id: '', // API will generate
      date: payload.date || new Date().toISOString().slice(0, 10),
      time: startIso,
      topic: subjectName,
      tutorId: userId,
      tutorName: 'You',
      studentId: '',
      studentName: '',
      mode: payload.mode,
      location: payload.mode === 'In-Person' ? payload.location : undefined,
      link: payload.mode !== 'In-Person' ? payload.link : undefined,
      status: 'Open',
      currentCount: 0,
      maxCapacity: payload.capacity ?? 8,
    };

    // Gọi API để tạo meeting
    await meetingService.schedule(newMeeting);
    
    // Reload meetings từ API
    const updatedMeetings = await meetingService.getByTutor(userId);
    setMeetings(updatedMeetings);
  };

  if (loading) return <Typography sx={{ p: 3 }}>Đang tải...</Typography>;
  if (error) return <Typography sx={{ p: 3, color: 'error.main' }}>{error}</Typography>;

  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
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
        onStart={handleStart}
        onFinish={handleFinish}
        onCancel={() => {
          if (selected) setCancelTarget(selected);
        }}
      />

      <TutorSlotDialog
        open={slotOpen}
        onClose={() => setSlotOpen(false)}
        onCreate={handleCreateSlot}
        tutorId={userId || ''}
      />

      <CancelDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelComplete}
      />
    </Box>
  );
}
