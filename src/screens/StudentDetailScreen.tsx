import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  FileText,
  TrendingUp,
  MessageSquare,
  Download,
  Reply,
} from 'lucide-react';
import type { StudentProfile } from '@/domain/entities/student';
import { studentService } from '@/application/services/studentService';

interface StudentDetailScreenProps {
  studentId: string;
  onBack: () => void;
  onRecordProgress: (studentId: string) => void;
  onViewProgress: (studentId: string) => void;
  onViewAllFeedback: (studentId: string) => void;
  onExport: (studentId: string) => void;
}

export function StudentDetailScreen({
  studentId,
  onBack,
  onRecordProgress,
  onViewProgress,
  onViewAllFeedback,
  onExport,
}: StudentDetailScreenProps) {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<{
    id: string;
    message: string;
  } | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadStudent = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await studentService.getById(studentId);
        if (!mounted) return;
        setStudent(data ?? null);
      } catch (err) {
        if (!mounted) return;
        setError('Không thể tải thông tin sinh viên.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadStudent();
    return () => {
      mounted = false;
    };
  }, [studentId]);

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Đang tải thông tin sinh viên...
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{error || 'Student not found'}</p>
        <Button onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const handleReplyClick = (feedback: { id: string; message: string }) => {
    setSelectedFeedback(feedback);
    setReplyText('');
    setReplyDialogOpen(true);
  };

  const handleSaveReply = () => {
    if (selectedFeedback && student) {
      // In a real app, this would update the backend
      console.log('Saving reply for feedback', selectedFeedback.id, replyText);
      setStudent({
        ...student,
        feedback: student.feedback.map((f) =>
          f.id === selectedFeedback.id ? { ...f, status: 'Responded', response: replyText } : f,
        ),
      });
      setReplyDialogOpen(false);
      setSelectedFeedback(null);
      setReplyText('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{student.name}</h1>
            <p className="text-muted-foreground">{student.studentId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onRecordProgress(studentId)}
            className="bg-primary hover:bg-primary-dark"
          >
            <FileText className="mr-2 h-4 w-4" />
            Record Progress
          </Button>
          <Button
            onClick={() => onViewProgress(studentId)}
            variant="outline"
            className="border-purple-500 text-purple-700 hover:bg-purple-50"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            View Progress
          </Button>
          <Button
            onClick={() => onViewAllFeedback(studentId)}
            variant="outline"
            className="border-orange-500 text-orange-700 hover:bg-orange-50"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            All Feedback
          </Button>
          <Button
            onClick={() => onExport(studentId)}
            variant="outline"
            className="border-gray-500 text-gray-700 hover:bg-gray-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="sessions">Session History</TabsTrigger>
          <TabsTrigger value="progress">Progress & Performance</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{student.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm">{student.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <p className="text-sm">{student.personalInfo.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Major</p>
                  <p className="text-sm">{student.personalInfo.major}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Year</p>
                  <p className="text-sm">Year {student.personalInfo.year}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Join Date</p>
                  <p className="text-sm">{student.joinDate}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="text-sm">{student.personalInfo.address}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Session History Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration (min)</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.sessionHistory.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{session.date}</TableCell>
                      <TableCell>{session.duration}</TableCell>
                      <TableCell>{session.topic}</TableCell>
                      <TableCell className="max-w-md">{session.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress & Performance Tab */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress & Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Progress Overview</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span className="font-semibold">{student.progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-4">
                      <div
                        className="bg-primary h-4 rounded-full transition-all"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Performance Chart</h3>
                  <div className="space-y-4">
                    {student.progressData.map((data, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{data.category} - {data.date}</span>
                          <span className="font-semibold">{data.score}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-3">
                          <div
                            className="bg-primary h-3 rounded-full transition-all"
                            style={{ width: `${data.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">{student.totalSessions}</p>
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">{student.rating}</p>
                    <p className="text-sm text-muted-foreground">Rating</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">{student.lastSession}</p>
                    <p className="text-sm text-muted-foreground">Last Session</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.feedback.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            feedback.status === 'Pending' ? 'warning' : 'success'
                          }
                        >
                          {feedback.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {feedback.date}
                        </span>
                      </div>
                      {feedback.status === 'Pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleReplyClick({ id: feedback.id, message: feedback.message })
                          }
                        >
                          <Reply className="mr-2 h-4 w-4" />
                          Reply
                        </Button>
                      )}
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium mb-1">Student Message:</p>
                      <p className="text-sm">{feedback.message}</p>
                    </div>
                    {feedback.status === 'Responded' && feedback.response && (
                      <div className="bg-primary/10 p-3 rounded-md">
                        <p className="text-sm font-medium mb-1">Your Response:</p>
                        <p className="text-sm">{feedback.response}</p>
                      </div>
                    )}
                  </div>
                ))}
                {student.feedback.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No feedback available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Feedback</DialogTitle>
            <DialogDescription>
              Enter your response to the student's feedback.
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4 py-4">
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium mb-1">Student Message:</p>
                <p className="text-sm">{selectedFeedback.message}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Response</label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Enter your response..."
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReplyDialogOpen(false);
                setSelectedFeedback(null);
                setReplyText('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveReply} disabled={!replyText.trim()}>
              Save Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

