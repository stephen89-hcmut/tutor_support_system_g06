import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Save, UserX } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { notificationManager } from '@/services/NotificationSystem';
import type { OverallRating, AttendanceStatus } from '@/domain/entities/progress';
import type { StudentProfile } from '@/domain/entities/student';
import type { Meeting } from '@/domain/entities/meeting';
import { studentService } from '@/application/services/studentService';
import { meetingService } from '@/application/services/meetingService';

interface RecordProgressPageProps {
  studentId: string;
  onBack: () => void;
  onSave: () => void;
}

export function RecordProgressPage({
  studentId,
  onBack,
  onSave,
}: RecordProgressPageProps) {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [availableSessions, setAvailableSessions] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [attendance, setAttendance] = useState<AttendanceStatus>('Present');
  const [absenceReason, setAbsenceReason] = useState('');
  const [understanding, setUnderstanding] = useState(0);
  const [problemSolving, setProblemSolving] = useState(0);
  const [codeQuality, setCodeQuality] = useState(0);
  const [participation, setParticipation] = useState(0);
  const [overallRating, setOverallRating] = useState<OverallRating>('Good');
  const [tutorComments, setTutorComments] = useState('');
  const [privateNote, setPrivateNote] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [studentData, meetingData] = await Promise.all([
          studentService.getById(studentId),
          meetingService.getByStudent(studentId),
        ]);
        if (!mounted) return;
        setStudent(studentData ?? null);
        setAvailableSessions(meetingData.filter((m) => m.status === 'Completed'));
      } catch (err) {
        if (!mounted) return;
        setError('Không thể tải dữ liệu sinh viên hoặc buổi học.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [studentId]);

  const handleSave = () => {
    // Validation
    if (!selectedSessionId) {
      toast({
        variant: 'error',
        title: 'Error',
        description: 'Please select a session.',
      });
      return;
    }

    if (attendance === 'Absent' && !absenceReason.trim()) {
      toast({
        variant: 'error',
        title: 'Error',
        description: 'Please provide a reason for absence.',
      });
      return;
    }

    if (attendance === 'Present') {
      if (understanding === 0 && problemSolving === 0 && codeQuality === 0 && participation === 0) {
        toast({
          variant: 'error',
          title: 'Error',
          description: 'Please enter performance metrics.',
        });
        return;
      }
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    try {
      // In real app, this would save to backend
      console.log('Saving progress:', {
        studentId,
        sessionId: selectedSessionId,
        attendance,
        absenceReason,
        understanding,
        problemSolving,
        codeQuality,
        participation,
        overallRating,
        tutorComments,
        privateNote: isPrivate ? privateNote : undefined,
      });

      // Send notifications
      if (student) {
        const message = attendance === 'Present'
          ? `Your progress for the session has been recorded. Overall rating: ${overallRating}`
          : `Your absence has been recorded. Reason: ${absenceReason}`;

        await notificationManager.sendMultiChannel(
          student.name,
          message,
          'Progress Recorded'
        );
      }

      toast({
        title: 'Success',
        description: 'Progress recorded successfully.',
      });

      setShowConfirmDialog(false);
      onSave();
    } catch (error) {
      toast({
        variant: 'error',
        title: 'Error',
        description: 'Failed to save progress. Please try again.',
      });
    }
  };

  const calculateOverallRating = () => {
    if (attendance === 'Absent') return;
    
    const avg = (understanding + problemSolving + codeQuality + participation) / 4;
    if (avg >= 90) setOverallRating('Excellent');
    else if (avg >= 75) setOverallRating('Good');
    else if (avg >= 60) setOverallRating('Average');
    else setOverallRating('Needs Improvement');
  };

  useEffect(() => {
    if (attendance === 'Present') {
      calculateOverallRating();
    }
  }, [understanding, problemSolving, codeQuality, participation, attendance]);

  const selectedSession = availableSessions.find((s) => s.id === selectedSessionId);

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Đang tải dữ liệu phiên học và sinh viên...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Record Student Progress</h1>
          <p className="text-muted-foreground">
            Record progress for {student?.name || 'Student'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="session">Session</Label>
            <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
              <SelectTrigger id="session">
                <SelectValue placeholder="Select a completed session" />
              </SelectTrigger>
              <SelectContent>
                {availableSessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.date} at {session.time} - {session.topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSession && (
              <p className="text-sm text-muted-foreground mt-2">
                {selectedSession.topic} with {selectedSession.tutorName}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedSessionId && (
        <>
          {/* Attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant={attendance === 'Present' ? 'default' : 'outline'}
                  onClick={() => setAttendance('Present')}
                >
                  Present
                </Button>
                <Button
                  variant={attendance === 'Absent' ? 'default' : 'outline'}
                  onClick={() => setAttendance('Absent')}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Student Absent
                </Button>
              </div>

              {attendance === 'Absent' && (
                <div className="space-y-2">
                  <Label htmlFor="absenceReason">Reason for Absence</Label>
                  <Textarea
                    id="absenceReason"
                    value={absenceReason}
                    onChange={(e) => setAbsenceReason(e.target.value)}
                    placeholder="Enter reason for absence..."
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics (only if present) */}
          {attendance === 'Present' && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="understanding">Understanding</Label>
                    <span className="text-sm font-medium">{understanding}%</span>
                  </div>
                  <Input
                    id="understanding"
                    type="range"
                    min="0"
                    max="100"
                    value={understanding}
                    onChange={(e) => setUnderstanding(Number(e.target.value))}
                    className="w-full"
                  />
                  <Progress value={understanding} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="problemSolving">Problem Solving</Label>
                    <span className="text-sm font-medium">{problemSolving}%</span>
                  </div>
                  <Input
                    id="problemSolving"
                    type="range"
                    min="0"
                    max="100"
                    value={problemSolving}
                    onChange={(e) => setProblemSolving(Number(e.target.value))}
                    className="w-full"
                  />
                  <Progress value={problemSolving} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="codeQuality">Code Quality</Label>
                    <span className="text-sm font-medium">{codeQuality}%</span>
                  </div>
                  <Input
                    id="codeQuality"
                    type="range"
                    min="0"
                    max="100"
                    value={codeQuality}
                    onChange={(e) => setCodeQuality(Number(e.target.value))}
                    className="w-full"
                  />
                  <Progress value={codeQuality} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="participation">Participation</Label>
                    <span className="text-sm font-medium">{participation}%</span>
                  </div>
                  <Input
                    id="participation"
                    type="range"
                    min="0"
                    max="100"
                    value={participation}
                    onChange={(e) => setParticipation(Number(e.target.value))}
                    className="w-full"
                  />
                  <Progress value={participation} className="h-2" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overallRating">Overall Rating</Label>
                  <Select value={overallRating} onValueChange={(value) => setOverallRating(value as OverallRating)}>
                    <SelectTrigger id="overallRating">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Average">Average</SelectItem>
                      <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle>Tutor Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tutorComments">Comments</Label>
                <Textarea
                  id="tutorComments"
                  value={tutorComments}
                  onChange={(e) => setTutorComments(e.target.value)}
                  placeholder="Enter your comments about the student's performance..."
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="private" className="flex flex-col space-y-1">
                  <span>Private Note</span>
                  <span className="text-xs text-muted-foreground">
                    This note will only be visible to tutors and managers
                  </span>
                </Label>
                <Switch
                  id="private"
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
              </div>

              {isPrivate && (
                <div className="space-y-2">
                  <Label htmlFor="privateNote">Private Note</Label>
                  <Textarea
                    id="privateNote"
                    value={privateNote}
                    onChange={(e) => setPrivateNote(e.target.value)}
                    placeholder="Enter private notes (visible only to tutors and managers)..."
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Progress
            </Button>
          </div>
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Save</DialogTitle>
            <DialogDescription>
              Are you sure you want to save this progress record?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSave}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

