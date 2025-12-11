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
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Toolbar,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Search, X, Eye } from 'lucide-react';
import { meetingService } from '@/application/services/meetingService';
import { profileService } from '@/application/services/profileService';
import type { Meeting, MeetingStatus } from '@/domain/entities/meeting';
import type { Profile } from '@/domain/entities/profile';

interface ManagerMeetingPageProps {
  onBack: () => void;
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

const MeetingDetailDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  studentProfile: Profile | null;
  tutorProfile: Profile | null;
}> = ({ open, onClose, meeting, studentProfile, tutorProfile }) => {
  if (!meeting) return null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 450, p: 3 }}>
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
            <Typography variant="caption" color="text.secondary">Trạng thái</Typography>
            <Box sx={{ mt: 0.5 }}><MeetingStatusChip status={meeting.status} /></Box>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Hình thức</Typography>
            <Typography variant="body1">{meeting.mode === 'In-Person' ? 'Offline' : 'Online'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Địa điểm / Link</Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
              {meeting.mode === 'In-Person' ? meeting.location : meeting.link}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Sĩ số</Typography>
            <Typography variant="body1">{meeting.currentCount ?? 0} / {meeting.maxCapacity ?? 10}</Typography>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(100, ((meeting.currentCount ?? 0) / (meeting.maxCapacity || 1)) * 100)} 
              sx={{ mt: 1 }} 
            />
          </Box>

          {/* Student Info */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Sinh viên</Typography>
            <Typography variant="body2">{meeting.studentName || 'Chưa có'}</Typography>
            {studentProfile && (
              <>
                <Typography variant="caption" color="text.secondary">Email: {studentProfile.email}</Typography>
                <br />
                <Typography variant="caption" color="text.secondary">Phone: {studentProfile.phoneNumber || 'N/A'}</Typography>
              </>
            )}
          </Box>

          {/* Tutor Info */}
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Tutor</Typography>
            <Typography variant="body2">{meeting.tutorName}</Typography>
            {tutorProfile && (
              <>
                <Typography variant="caption" color="text.secondary">Email: {tutorProfile.email}</Typography>
                <br />
                <Typography variant="caption" color="text.secondary">Phone: {tutorProfile.phoneNumber || 'N/A'}</Typography>
              </>
            )}
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );
};

export function ManagerMeetingPage({ onBack }: ManagerMeetingPageProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [participantProfiles, setParticipantProfiles] = useState<{
    student: Profile | null;
    tutor: Profile | null;
  }>({ student: null, tutor: null });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await meetingService.getAll();
        if (!mounted) return;
        setMeetings(data);
        setFilteredMeetings(data);
      } catch (err) {
        if (!mounted) return;
        setError('Không thể tải danh sách buổi học.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let results = meetings;

    // Filter by status
    if (statusFilter !== 'all') {
      results = results.filter((m) => m.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter((m) => {
        const studentName = m.studentName?.toLowerCase() || '';
        const tutorName = m.tutorName?.toLowerCase() || '';
        const topic = m.topic?.toLowerCase() || '';
        return studentName.includes(query) || tutorName.includes(query) || topic.includes(query);
      });
    }

    setFilteredMeetings(results);
  }, [meetings, searchQuery, statusFilter]);

  useEffect(() => {
    if (!selectedMeeting) {
      setParticipantProfiles({ student: null, tutor: null });
      return;
    }

    let mounted = true;
    const loadProfiles = async () => {
      try {
        const [studentProfile, tutorProfile] = await Promise.all([
          selectedMeeting.studentId ? profileService.getProfileByUserId(selectedMeeting.studentId).catch(() => null) : Promise.resolve(null),
          selectedMeeting.tutorId ? profileService.getProfileByUserId(selectedMeeting.tutorId).catch(() => null) : Promise.resolve(null),
        ]);
        if (!mounted) return;
        setParticipantProfiles({ student: studentProfile, tutor: tutorProfile });
      } catch (err) {
        if (!mounted) return;
        console.error('Failed to load participant profiles', err);
      }
    };
    loadProfiles();
    return () => { mounted = false; };
  }, [selectedMeeting]);

  const handleViewDetail = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setDrawerOpen(true);
  };

  if (loading) return <Typography sx={{ p: 3 }}>Đang tải...</Typography>;
  if (error) return <Typography sx={{ p: 3, color: 'error.main' }}>{error}</Typography>;

  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h5">Quản lý buổi học</Typography>
        <Button variant="outlined" onClick={onBack}>Quay lại</Button>
      </Toolbar>

      {/* Filters */}
      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm theo tên sinh viên, tutor, môn học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={20} style={{ marginRight: 8 }} />,
                  endAdornment: searchQuery && (
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <X size={16} />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            <Grid xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Trạng thái">
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Full">Full</MenuItem>
                  <MenuItem value="Scheduled">Upcoming</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                  Tổng: {filteredMeetings.length} buổi
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Meetings Table */}
      <Card variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ngày giờ</TableCell>
              <TableCell>Môn học</TableCell>
              <TableCell>Sinh viên</TableCell>
              <TableCell>Tutor</TableCell>
              <TableCell>Hình thức</TableCell>
              <TableCell>Sĩ số</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMeetings.map((m) => (
              <TableRow key={m.id} hover>
                <TableCell>
                  <Typography variant="body2">{formatMeetingDate(m)}</Typography>
                  <Typography variant="caption" color="text.secondary">{formatMeetingTime(m)}</Typography>
                </TableCell>
                <TableCell>{m.topic}</TableCell>
                <TableCell>{m.studentName || '-'}</TableCell>
                <TableCell>{m.tutorName}</TableCell>
                <TableCell>{m.mode === 'In-Person' ? 'Offline' : 'Online'}</TableCell>
                <TableCell>{m.currentCount ?? 0} / {m.maxCapacity ?? 10}</TableCell>
                <TableCell><MeetingStatusChip status={m.status} /></TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleViewDetail(m)}>
                    <Eye size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredMeetings.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary">Không tìm thấy buổi học nào.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <MeetingDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        meeting={selectedMeeting}
        studentProfile={participantProfiles.student}
        tutorProfile={participantProfiles.tutor}
      />
    </Box>
  );
}
