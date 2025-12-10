import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Rating,
  Stack,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import type { UserProfile } from '@/domain/entities/profile';
import { useRole } from '@/contexts/RoleContext';
import { profileService } from '@/application/services/profileService';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

// Extended profile fields used by the UI only
 type ExtendedProfile = UserProfile & {
  personalEmail?: string;
  learningStyles?: string[];
  weakSubjectsList?: string[];
  teachingMethod?: string;
  certificates?: string[];
  status?: 'Available' | 'Busy';
  ratingCount?: number;
};

const brandBlue = '#003366';
const readonlyBg = '#f5f5f5';
const readonlyText = '#455a64';

const studentLearningData = [
  { skill: 'Hiểu bài', value: 78 },
  { skill: 'Thực hành', value: 70 },
  { skill: 'Chuyên cần', value: 88 },
];

const bestReviews = [
  { id: 'r1', name: 'Ẩn danh', rating: 5, comment: 'Tutor nhiệt tình, giải thích dễ hiểu, luôn đúng giờ.' },
  { id: 'r2', name: 'Sinh viên K17', rating: 4.5, comment: 'Bài tập thực hành sát đề, phản hồi nhanh.' },
  { id: 'r3', name: 'HCMUT Student', rating: 5, comment: 'Giúp mình vượt qua môn Giải tích với điểm cao.' },
];

const expertiseOptions = ['Cấu trúc dữ liệu', 'Lập trình C++', 'Toán rời rạc', 'Giải tích 1', 'Vật lý đại cương'];
const learningStyleOptions = ['Visual', 'Thực hành', 'Lý thuyết', 'Tương tác', 'Tự học có hướng dẫn'];
const subjectOptions = ['Giải tích 1', 'Vật lý đại cương', 'CTDL', 'Xác suất', 'Toán rời rạc'];

const TextFieldRO = ({ label, value }: { label: string; value?: string | number | null }) => (
  <TextField
    label={label}
    value={value ?? '—'}
    fullWidth
    variant="outlined"
    InputProps={{
      readOnly: true,
      startAdornment: (
        <InputAdornment position="start">
          <LockIcon fontSize="small" sx={{ color: readonlyText }} />
        </InputAdornment>
      ),
    }}
    sx={{ bgcolor: readonlyBg }}
  />
);

const StatPill = ({ label, value }: { label: string; value: string }) => (
  <Paper elevation={0} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#eef2f7' }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="h6" color="text.primary" fontWeight={700}>{value}</Typography>
  </Paper>
);

const StudentView: React.FC<{
  profile: ExtendedProfile;
  editable: boolean;
  onChange: (patch: Partial<ExtendedProfile>) => void;
}> = ({ profile, editable, onChange }) => (
  <Stack spacing={3}>
    <Paper elevation={1} sx={{ p: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
        <Avatar sx={{ width: 100, height: 100, bgcolor: brandBlue, fontSize: 36 }}>{profile.initials || 'SV'}</Avatar>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h4" fontWeight={700}>{profile.fullName || 'Sinh viên HCMUT'}</Typography>
            <VerifiedIcon color="success" />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
            <Typography variant="subtitle1" color="text.secondary">MSSV: {profile.studentId || 'N/A'}</Typography>
            <CheckCircleIcon fontSize="small" color="success" />
            <Chip label="Student" color="info" size="small" />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
            <StatPill label="Số buổi đã học" value="24" />
            <StatPill label="Số giờ tích lũy" value="56h" />
            <StatPill label="Cảnh báo" value="0" />
          </Stack>
        </Box>
      </Stack>
    </Paper>

    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Paper elevation={0} sx={{ p: 2.5, bgcolor: readonlyBg, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={700} color="text.secondary" sx={{ mb: 2 }}>Thông tin học vụ (Datacore)</Typography>
          <Stack spacing={2}>
            <TextFieldRO label="Email trường" value={profile.email || '...@hcmut.edu.vn'} />
            <TextFieldRO label="Khoa" value={profile.department || 'Công nghệ thông tin'} />
            <TextFieldRO label="Ngành" value={profile.major || 'Khoa học máy tính'} />
            <TextFieldRO label="Niên khóa" value={profile.year || 'K17'} />
          </Stack>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Thông tin cá nhân & nhu cầu</Typography>
          <Stack spacing={2}>
            <TextField
              label="Số điện thoại"
              value={profile.phone || ''}
              onChange={(e) => onChange({ phone: e.target.value })}
              fullWidth
              variant={editable ? 'outlined' : 'standard'}
              InputProps={{ readOnly: !editable }}
            />
            <TextField
              label="Email cá nhân"
              value={profile.personalEmail || ''}
              onChange={(e) => onChange({ personalEmail: e.target.value })}
              fullWidth
              variant={editable ? 'outlined' : 'standard'}
              InputProps={{ readOnly: !editable }}
            />
            <TextField
              label="Giới thiệu"
              value={profile.about || ''}
              onChange={(e) => onChange({ about: e.target.value })}
              fullWidth
              multiline
              rows={3}
              variant={editable ? 'outlined' : 'standard'}
              InputProps={{ readOnly: !editable }}
            />
            <Autocomplete
              multiple
              freeSolo
              options={learningStyleOptions}
              value={profile.learningStyles || []}
              onChange={(_, val) => onChange({ learningStyles: val })}
              renderInput={(params) => <TextField {...params} label="Sở thích học tập" variant={editable ? 'outlined' : 'standard'} InputProps={{ ...params.InputProps, readOnly: !editable }} />}
              disabled={!editable}
            />
            <Autocomplete
              multiple
              freeSolo
              options={subjectOptions}
              value={profile.weakSubjectsList || []}
              onChange={(_, val) => onChange({ weakSubjectsList: val })}
              renderInput={(params) => <TextField {...params} label="Môn cần hỗ trợ" variant={editable ? 'outlined' : 'standard'} InputProps={{ ...params.InputProps, readOnly: !editable }} />}
              disabled={!editable}
            />
          </Stack>
        </Paper>
      </Grid>
    </Grid>

    <Card sx={{ borderColor: 'divider' }}>
      <CardHeader title="Learning Overview" />
      <CardContent sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={studentLearningData} outerRadius="70%">
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" tick={{ fill: brandBlue, fontWeight: 600 }} />
            <PolarRadiusAxis tick={{ fill: '#607d8b' }} />
            <Radar name="Kết quả" dataKey="value" stroke={brandBlue} fill={brandBlue} fillOpacity={0.35} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </Stack>
);

const TutorView: React.FC<{
  profile: ExtendedProfile;
  editable: boolean;
  onChange: (patch: Partial<ExtendedProfile>) => void;
}> = ({ profile, editable, onChange }) => (
  <Stack spacing={3}>
    <Paper elevation={1} sx={{ p: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
        <Avatar sx={{ width: 100, height: 100, bgcolor: brandBlue, fontSize: 36 }}>{profile.initials || 'TT'}</Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={700}>{profile.fullName || 'Tutor HCMUT'}</Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
            <Chip label={profile.status || 'Available'} color={(profile.status || 'Available') === 'Available' ? 'success' : 'error'} size="small" />
            <Chip label="Tutor" color="info" size="small" />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mt: 2 }}>
            <Box>
              <Typography variant="h3" fontWeight={800}>{profile.ratingAvg?.toFixed(1) || '4.8'}</Typography>
              <Typography variant="body2" color="text.secondary">/5.0</Typography>
            </Box>
            <Rating value={profile.ratingAvg || 4.8} precision={0.1} readOnly />
            <Typography variant="body2" color="text.secondary">({profile.ratingCount || 128} đánh giá)</Typography>
          </Stack>
        </Box>
      </Stack>
    </Paper>

    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Hồ sơ năng lực</Typography>
          <Stack spacing={2}>
            <Autocomplete
              multiple
              freeSolo
              options={expertiseOptions}
              value={profile.expertise || []}
              onChange={(_, val) => onChange({ expertise: val })}
              renderInput={(params) => <TextField {...params} label="Chuyên môn" variant={editable ? 'outlined' : 'standard'} InputProps={{ ...params.InputProps, readOnly: !editable }} />}
              disabled={!editable}
            />
            <TextField
              label="Phương pháp dạy"
              value={profile.teachingMethod || ''}
              onChange={(e) => onChange({ teachingMethod: e.target.value })}
              fullWidth
              multiline
              rows={3}
              variant={editable ? 'outlined' : 'standard'}
              InputProps={{ readOnly: !editable }}
            />
            <TextField
              label="Giới thiệu"
              value={profile.about || ''}
              onChange={(e) => onChange({ about: e.target.value })}
              fullWidth
              multiline
              rows={4}
              variant={editable ? 'outlined' : 'standard'}
              InputProps={{ readOnly: !editable }}
            />
            <Stack spacing={1}>
              <Typography variant="subtitle2">Chứng chỉ</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {(profile.certificates || ['IELTS 7.5', 'Bảng điểm HCMUT']).map((c) => (
                  <Chip key={c} label={c} icon={<StarIcon sx={{ color: '#fbc02d' }} />} variant="outlined" />
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={0} sx={{ p: 2.5, bgcolor: readonlyBg, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={700} color="text.secondary" sx={{ mb: 2 }}>Thông tin hành chính</Typography>
          <Stack spacing={2}>
            <TextFieldRO label="Mã Tutor" value={profile.tutorId || 'T-0001'} />
            <TextFieldRO label="Khoa/Đơn vị" value={profile.department || 'Khoa Khoa học & Kỹ thuật máy tính'} />
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">Thống kê dạy</Typography>
            <List dense sx={{ pt: 0 }}>
              <ListItem disableGutters>
                <ListItemText primary="Tổng giờ dạy" secondary="150h" primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Số sinh viên đã hướng dẫn" secondary="45" primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Tỷ lệ phản hồi" secondary="98%" primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItem>
            </List>
          </Stack>
        </Paper>
      </Grid>
    </Grid>

    <Card sx={{ borderColor: 'divider' }}>
      <CardHeader title="Feedback nổi bật" />
      <CardContent>
        <Grid container spacing={2}>
          {bestReviews.map((rev) => (
            <Grid item xs={12} md={4} key={rev.id}>
              <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Avatar sx={{ bgcolor: brandBlue }}>{rev.name[0]}</Avatar>
                  <Typography variant="subtitle1" fontWeight={700}>{rev.name}</Typography>
                </Stack>
                <Rating value={rev.rating} precision={0.5} readOnly size="small" />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{rev.comment}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  </Stack>
);

interface ProfilePageProps {
  onBack: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { role } = useRole();
  const [profile, setProfile] = useState<ExtendedProfile | null>(null);
  const [edited, setEdited] = useState<ExtendedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!role) return;
      setLoading(true);
      try {
        const data = await profileService.getProfileByRole(role);
        if (!mounted) return;
        const fallback: ExtendedProfile = {
          ...data,
          personalEmail: data.email,
          learningStyles: ['Visual', 'Thực hành'],
          weakSubjectsList: ['Giải tích 1'],
          teachingMethod: 'Dạy kỹ bản chất, live code trực tiếp, không dạy vẹt.',
          certificates: ['IELTS 7.5', 'Bảng điểm HCMUT'],
          status: 'Available',
          ratingCount: 128,
        };
        setProfile(fallback);
        setEdited(fallback);
      } catch (err) {
        if (!mounted) return;
        setError('Không thể tải hồ sơ người dùng.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [role]);

  const handleChange = (patch: Partial<ExtendedProfile>) => {
    setEdited((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleSave = () => {
    if (!edited) return;
    setProfile(edited);
    setEditing(false);
  };

  const handleCancel = () => {
    setEdited(profile);
    setEditing(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1200);
  };

  const content = useMemo(() => {
    if (!edited || !role) return null;
    if (role === 'Tutor') return <TutorView profile={edited} editable={editing} onChange={handleChange} />;
    return <StudentView profile={edited} editable={editing} onChange={handleChange} />;
  }, [edited, role, editing]);

  if (loading) return <Typography sx={{ p: 4 }} color="text.secondary">Đang tải hồ sơ...</Typography>;
  if (error || !profile) return <Typography sx={{ p: 4 }} color="error.main">{error || 'Không có dữ liệu'}</Typography>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} color={brandBlue}>Hồ sơ cá nhân</Typography>
          <Typography variant="body2" color="text.secondary">Quản lý thông tin và đồng bộ dữ liệu</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="info" startIcon={<SyncIcon />} onClick={handleSync} disabled={syncing}>
            {syncing ? 'Đang đồng bộ...' : 'Sync Data'}
          </Button>
          {!editing ? (
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditing(true)} sx={{ bgcolor: brandBlue }}>
              Edit Profile
            </Button>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<CloseIcon />} onClick={handleCancel}>Cancel</Button>
              <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSave} sx={{ bgcolor: brandBlue }}>
                Save
              </Button>
            </Stack>
          )}
        </Stack>
      </Stack>

      {content}
    </Box>
  );
}
