import { useState, useMemo, useEffect } from 'react';
import { useRole } from '@/contexts/RoleContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
  Avatar,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Search, Star, Edit, AlertTriangle, Eye } from 'lucide-react';
import { studentService } from '@/application/services/studentService';
import { meetingService } from '@/application/services/meetingService';
import type { Meeting } from '@/domain/entities/meeting';
import { mockProgressRecords } from '@/data/mockProgress';
import type { ProgressRecord } from '@/domain/entities/progress';

interface StudentWithProgress {
  studentId: string;
  studentName: string;
  studentCode: string;
  email?: string;
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  avgRating: number;
  latestSession?: string;
  meetings: Meeting[];
  progressRecords: ProgressRecord[];
  status?: 'Active' | 'At Risk';
  department?: string;
  weakSubjects?: string[];
  learningStyle?: string;
}

interface TutorStudentsPageProps {
  onViewStudent?: (studentId: string) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const days = ['CN', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const day = days[date.getDay()];
  return `${day}, ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const endDate = new Date(date.getTime() + 2 * 60 * 60 * 1000);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} - ${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
};

const StudentDetailModal: React.FC<{
  open: boolean;
  onClose: () => void;
  student: StudentWithProgress | null;
}> = ({ open, onClose, student }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!student) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
            {student.studentName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6">{student.studentName}</Typography>
            <Typography variant="body2" color="text.secondary">
              MSSV: {student.studentCode}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {student.learningStyle && (
            <Chip label={student.learningStyle} size="small" color="primary" variant="outlined" />
          )}
          {student.weakSubjects && student.weakSubjects.map((subject) => (
            <Chip key={subject} label={`Yếu: ${subject}`} size="small" color="error" variant="outlined" />
          ))}
        </Stack>
      </DialogTitle>
      
      <DialogContent dividers>
        <Typography variant="subtitle2" gutterBottom>
          Lịch sử buổi học ({student.meetings.length})
        </Typography>

        <Stack spacing={2} sx={{ mt: 2 }}>
          {student.meetings.map((meeting) => {
            const progress = student.progressRecords.find(p => p.sessionId === meeting.id);
            const isCompleted = meeting.status === 'Completed';
            const isUpcoming = meeting.status === 'Scheduled' || meeting.status === 'Confirmed';

            return (
              <Card key={meeting.id} variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2">{meeting.topic}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(meeting.date)} • {formatTime(meeting.time)}
                      </Typography>
                    </Box>
                    <Chip 
                      label={isCompleted ? 'Có mặt' : isUpcoming ? 'Đã đăng ký' : meeting.status} 
                      size="small" 
                      color={isCompleted ? 'success' : isUpcoming ? 'warning' : 'default'}
                    />
                  </Stack>

                  {isCompleted && (
                    <Box sx={{ mt: 2 }}>
                      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                        <Tab label="ĐÁNH GIÁ CỦA BẠN" />
                        <Tab label="PHẢN HỒI SINH VIÊN" />
                      </Tabs>

                      {activeTab === 0 && progress && (
                        <Box sx={{ mt: 2 }}>
                          <Stack spacing={2}>
                            <Box>
                              <Stack direction="row" justifyContent="space-between">
                                <Typography variant="caption">Hiểu bài</Typography>
                                <Typography variant="caption">{progress.understanding}/10</Typography>
                              </Stack>
                              <LinearProgress 
                                variant="determinate" 
                                value={(progress.understanding / 10) * 100} 
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                            <Box>
                              <Stack direction="row" justifyContent="space-between">
                                <Typography variant="caption">Thực hành</Typography>
                                <Typography variant="caption">{progress.problemSolving}/10</Typography>
                              </Stack>
                              <LinearProgress 
                                variant="determinate" 
                                value={(progress.problemSolving / 10) * 100} 
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                            <Box>
                              <Stack direction="row" justifyContent="space-between">
                                <Typography variant="caption">Thái độ</Typography>
                                <Typography variant="caption">{progress.participation}/10</Typography>
                              </Stack>
                              <LinearProgress 
                                variant="determinate" 
                                value={(progress.participation / 10) * 100} 
                                sx={{ mt: 0.5 }}
                              />
                            </Box>

                            <Divider />

                            <Box>
                              <Typography variant="caption" color="text.secondary">Nhận xét công khai</Typography>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {progress.tutorComments || 'Em đã nắm được khái niệm gợi hạn cơ bản. Cần luyện tập thêm các dạng bài khó.'}
                              </Typography>
                            </Box>

                            {progress.overallRating === 'Needs Improvement' && (
                              <Box sx={{ p: 1.5, bgcolor: 'warning.light', borderRadius: 1, display: 'flex', gap: 1 }}>
                                <AlertTriangle size={18} color="orange" />
                                <Box>
                                  <Typography variant="body2" fontWeight="medium" color="warning.dark">
                                    Cần cải thiện (Rất kém trừu)
                                  </Typography>
                                  <Typography variant="caption" color="warning.dark">
                                    {progress.tutorComments || 'Học sinh cần tập trung hơn'}
                                  </Typography>
                                </Box>
                              </Box>
                            )}

                            <Button variant="outlined" startIcon={<Edit size={16} />} size="small">
                              Chỉnh sửa
                            </Button>
                          </Stack>
                        </Box>
                      )}

                      {activeTab === 1 && meeting.studentRating && (
                        <Box sx={{ mt: 2 }}>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                size={20} 
                                fill={star <= (meeting.studentRating?.knowledge || 0) ? 'orange' : 'none'}
                                color="orange"
                              />
                            ))}
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              ({meeting.studentRating.knowledge}/5)
                            </Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {meeting.studentRating.comment || '"Thầy giảng rất hay và dễ hiểu. Em cảm ơn thầy!"'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            Đánh giá ngày {meeting.studentRating.submittedAt ? new Date(meeting.studentRating.submittedAt).toLocaleDateString('vi-VN') : '18/01/2024'}
                          </Typography>
                          <Button variant="text" size="small" sx={{ mt: 1 }}>
                            Trả lời
                          </Button>
                        </Box>
                      )}

                      {activeTab === 1 && !meeting.studentRating && (
                        <Box sx={{ mt: 2, textAlign: 'center', py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            Đang chờ đánh giá từ sinh viên
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {!isCompleted && !progress && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Chưa có đánh giá
                      </Typography>
                      <Button variant="outlined" size="small" startIcon={<Edit size={16} />}>
                        Ghi nhận tiến độ ngay
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button variant="contained" startIcon={<Eye size={16} />}>
          Xem hồ sơ đầy đủ
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export function TutorStudentsPage({ onViewStudent }: TutorStudentsPageProps = {}) {
  const { userId } = useRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [students, setStudents] = useState<StudentWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithProgress | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const tutorId = userId;
    if (!tutorId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadStudents = async () => {
      try {
        console.log('Loading students for tutor:', tutorId);
        
        // Get students from API
        const apiStudents = await studentService.getTutorStudents(tutorId);
        console.log('API returned students:', apiStudents.length);
        
        // Get meetings for each student to get full data
        const studentsWithDetails = await Promise.all(
          apiStudents.map(async (apiStudent) => {
            try {
              // Get meetings for this student-tutor pair
              const allMeetings = await meetingService.getAll();
              const studentMeetings = allMeetings.filter(
                m => m.studentId === apiStudent.studentId && m.tutorId === tutorId
              );
              
              // Get progress records
              const studentProgress = mockProgressRecords.filter(
                p => p.studentId === apiStudent.studentId && p.tutorId === tutorId
              );

              // Calculate avg rating from progress records
              const avgRating = studentProgress.length > 0
                ? studentProgress.reduce((sum, p) => {
                    const rating = p.overallRating === 'Excellent' ? 5 : 
                                   p.overallRating === 'Good' ? 4 : 
                                   p.overallRating === 'Needs Improvement' ? 2 : 3;
                    return sum + rating;
                  }, 0) / studentProgress.length
                : 0;

              return {
                ...apiStudent,
                meetings: studentMeetings,
                progressRecords: studentProgress,
                avgRating,
                weakSubjects: ['Giải tích 1'], // TODO: Get from API
                learningStyle: 'Visual', // TODO: Get from API
                status: 'Active' as const,
              };
            } catch (err) {
              console.error('Error loading details for student:', apiStudent.studentId, err);
              return {
                ...apiStudent,
                meetings: [],
                progressRecords: [],
                avgRating: 0,
                weakSubjects: [],
                learningStyle: 'Visual',
                status: 'Active' as const,
              };
            }
          })
        );

        if (!mounted) return;
        
        console.log('Loaded students with details:', studentsWithDetails.length);
        setStudents(studentsWithDetails);
      } catch (error) {
        console.error('Failed to load tutor students:', error);
        if (!mounted) return;
        // Set error message
        const errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách học viên';
        setError(errorMessage);
        setStudents([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadStudents();
    
    return () => { mounted = false; };
  }, [userId]);

  const filteredStudents = useMemo(() => {
    let result = students;
    
    if (searchTerm) {
      result = result.filter(s =>
        s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (subjectFilter !== 'all') {
      // Filter by subject if needed
    }
    
    return result;
  }, [students, searchTerm, subjectFilter]);

  const totalStudents = students.length;
  const totalCompletedSessions = students.reduce((sum, s) => sum + s.completedSessions, 0);
  const avgRating = students.length > 0 
    ? (students.reduce((sum, s) => sum + s.avgRating, 0) / students.length).toFixed(1)
    : '0.0';

  const handleViewDetail = (student: StudentWithProgress) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, flexDirection: 'column', gap: 2 }}>
        <CircularProgress />
        <Typography>Đang tải danh sách học viên...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" gutterBottom>{error}</Typography>
        <Button onClick={() => window.location.reload()}>Thử lại</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Học viên của tôi</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Quản lý và theo dõi tiến độ học tập của sinh viên
      </Typography>

      <Grid container spacing={2} sx={{ mt: 2, mb: 3 }}>
        <Grid xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary.main">{totalStudents}</Typography>
              <Typography variant="body2" color="text.secondary">Tổng số học viên</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main">{totalCompletedSessions}</Typography>
              <Typography variant="body2" color="text.secondary">Buổi học hoàn thành</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main">{avgRating}</Typography>
              <Typography variant="body2" color="text.secondary">Đánh giá trung bình</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tên hoặc MSSV..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Môn học</InputLabel>
            <Select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} label="Môn học">
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="calculus">Giải tích</MenuItem>
              <MenuItem value="algebra">Đại số</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {filteredStudents.map((student) => (
          <Grid xs={12} md={6} lg={4} key={student.studentId}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                    {student.studentName.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {student.studentName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      MSSV: {student.studentCode}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                  {student.learningStyle && (
                    <Chip label={student.learningStyle} size="small" color="primary" variant="outlined" />
                  )}
                  {student.weakSubjects && student.weakSubjects.map((subject) => (
                    <Chip key={subject} label={`Yếu: ${subject}`} size="small" color="error" />
                  ))}
                </Stack>

                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption">Tiến độ</Typography>
                    <Typography variant="caption">{student.completedSessions}/{student.totalSessions} buổi</Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={(student.completedSessions / student.totalSessions) * 100} 
                    sx={{ mt: 0.5 }}
                  />
                </Box>

                <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Star size={16} fill="orange" color="orange" />
                    <Typography variant="body2">{student.avgRating.toFixed(1)}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">Hoàn thành</Typography>
                    <Typography variant="body2">{student.completedSessions}</Typography>
                  </Stack>
                </Stack>

                <Button 
                  fullWidth 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  startIcon={<Eye size={16} />}
                  onClick={() => handleViewDetail(student)}
                >
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {filteredStudents.length === 0 && (
          <Grid xs={12}>
            <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              Không tìm thấy học viên nào
            </Typography>
          </Grid>
        )}
      </Grid>

      <StudentDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        student={selectedStudent}
      />
    </Box>
  );
}
