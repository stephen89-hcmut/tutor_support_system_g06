import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, BookOpen, Calendar, Clock, AlertCircle, MessageCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { notificationManager } from '@/services/NotificationSystem';
import type { Meeting } from '@/domain/entities/meeting';
import type { ProgressRecord } from '@/domain/entities/progress';
import { meetingService } from '@/application/services/meetingService';
import { progressService } from '@/application/services/progressService';
import { mockStudentAccounts } from '@/data/mockUsers';
import { mockProgressRecords } from '@/data/mockProgress';

interface RecordProgressScreenNewProps {
  studentId: string;
  onBack: () => void;
}

export function RecordProgressScreenNew({
  studentId,
  onBack,
}: RecordProgressScreenNewProps) {
  const [sessions, setSessions] = useState<Meeting[]>([]);
  const [selectedSession, setSelectedSession] = useState<Meeting | null>(null);
  const [existingProgress, setExistingProgress] = useState<ProgressRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Form states
  const [isAbsent, setIsAbsent] = useState(false);
  const [understanding, setUnderstanding] = useState(70);
  const [problemSolving, setProblemSolving] = useState(70);
  const [codeQuality, setCodeQuality] = useState(70);
  const [participation, setParticipation] = useState(70);
  const [selectedRating, setSelectedRating] = useState<string>('Good');
  const [tutorComments, setTutorComments] = useState('');
  const [isPrivateNote, setIsPrivateNote] = useState(false);

  const studentAccount = mockStudentAccounts.find(acc => acc.userId === studentId);

  useEffect(() => {
    loadSessions();
  }, [studentId]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const meetings = await meetingService.getByStudent(studentId);
      const completedSessions = meetings.filter(m => m.status === 'Completed');
      setSessions(completedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordClick = (session: Meeting) => {
    // Check if progress already exists for this session
    const progress = mockProgressRecords.find(
      p => p.sessionId === session.id && p.studentId === studentId
    );

    if (progress) {
      // Load existing progress for editing
      setExistingProgress(progress);
      setIsAbsent(progress.attendance === 'Absent');
      setUnderstanding(progress.understanding);
      setProblemSolving(progress.problemSolving);
      setCodeQuality(progress.codeQuality);
      setParticipation(progress.participation);
      setSelectedRating(progress.overallRating);
      setTutorComments(progress.tutorComments || '');
      setIsPrivateNote(!!progress.privateNote);
    } else {
      // New progress record
      setExistingProgress(null);
      setIsAbsent(false);
      setUnderstanding(70);
      setProblemSolving(70);
      setCodeQuality(70);
      setParticipation(70);
      setSelectedRating('Good');
      setTutorComments('');
      setIsPrivateNote(false);
    }

    setSelectedSession(session);
  };

  const handleSaveProgress = async () => {
    if (!selectedSession) return;

    // Validation
    if (!isAbsent && !tutorComments.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: (
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div>Please provide comments about the session</div>
          </div>
        ),
      });
      return;
    }

    try {
      const progressData: Partial<ProgressRecord> = {
        sessionId: selectedSession.id,
        studentId: studentId,
        tutorId: selectedSession.tutorId,
        sessionDate: selectedSession.date,
        attendance: isAbsent ? 'Absent' : 'Present',
        understanding: isAbsent ? 0 : understanding,
        problemSolving: isAbsent ? 0 : problemSolving,
        codeQuality: isAbsent ? 0 : codeQuality,
        participation: isAbsent ? 0 : participation,
        overallRating: selectedRating as any,
        tutorComments: tutorComments,
        privateNote: isPrivateNote ? tutorComments : undefined,
        createdAt: new Date().toISOString(),
      };

      // Save progress (mock)
      console.log('Saving progress:', progressData);

      // Send notification to student
      if (studentAccount) {
        notificationManager.sendNotification(
          studentAccount.userId,
          `Progress recorded for session: ${selectedSession.topic}`,
          `Your tutor has recorded progress for the session on ${selectedSession.date}. Check your progress page for details.`
        );
      }

      toast({
        title: 'Success',
        description: '✓ Progress saved successfully and notification sent to student!',
        className: 'bg-green-50 border-green-200',
      });

      // Reset and go back to list
      setSelectedSession(null);
      loadSessions();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save progress. Please try again.',
      });
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return 'bg-green-500 text-white';
      case 'Good': return 'bg-blue-500 text-white';
      case 'Average': return 'bg-orange-500 text-white';
      case 'Needs Improvement': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case 'Excellent': return 'Excellent';
      case 'Good': return 'Good';
      case 'Average': return 'Average';
      case 'Needs Improvement': return 'Weak';
      default: return rating;
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading sessions...</div>;
  }

  // Show form when session is selected
  if (selectedSession) {
    return (
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Record Session Progress</h1>
            <p className="text-sm text-gray-500 mt-1">Document student performance and learning outcomes</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedSession(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sessions
          </Button>
        </div>

        {/* Session Info Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">{selectedSession.topic}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{selectedSession.date}</span>
                    <Clock className="h-3 w-3 ml-2" />
                    <span>{selectedSession.time}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-green-700">
                    {studentAccount?.username.substring(3, 5).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{studentAccount?.username || 'Student'}</h3>
                  <p className="text-xs text-gray-500">ID: {studentAccount?.studentId}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Absence Checkbox */}
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="absent"
                checked={isAbsent}
                onCheckedChange={(checked) => setIsAbsent(checked as boolean)}
              />
              <Label htmlFor="absent" className="text-sm font-medium cursor-pointer">
                Student was absent from this session
              </Label>
            </div>
            {isAbsent && (
              <p className="text-xs text-orange-700 mt-2 ml-6">
                Check this if the student did not attend the session
              </p>
            )}
          </CardContent>
        </Card>

        {/* Validation Error */}
        {!isAbsent && !tutorComments.trim() && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2 text-red-700">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">Please provide comments about the session</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skills Assessment */}
        {!isAbsent && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600">📊</span>
                </div>
                <h2 className="text-lg font-semibold">Skills Assessment</h2>
              </div>

              <div className="space-y-6">
                {/* Understanding */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Understanding of Concepts</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-blue-600">{understanding}%</span>
                      <span className="text-xs text-gray-500">
                        {understanding < 50 ? 'Needs Work' : understanding < 80 ? 'Excellent' : 'Excellent'}
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={understanding}
                    onChange={(e) => setUnderstanding(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Problem Solving */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Problem Solving Skills</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-blue-600">{problemSolving}%</span>
                      <span className="text-xs text-gray-500">
                        {problemSolving < 50 ? 'Needs Work' : problemSolving < 80 ? 'Excellent' : 'Excellent'}
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={problemSolving}
                    onChange={(e) => setProblemSolving(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Code Quality */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Code Quality & Best Practices</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-blue-600">{codeQuality}%</span>
                      <span className="text-xs text-gray-500">
                        {codeQuality < 50 ? 'Needs Work' : codeQuality < 80 ? 'Excellent' : 'Excellent'}
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={codeQuality}
                    onChange={(e) => setCodeQuality(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Participation */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Class Participation & Engagement</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-blue-600">{participation}%</span>
                      <span className="text-xs text-gray-500">
                        {participation < 50 ? 'Needs Work' : participation < 80 ? 'Excellent' : 'Excellent'}
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={participation}
                    onChange={(e) => setParticipation(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overall Rating */}
        {!isAbsent && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Overall Comprehension Level</h2>
              <div className="space-y-3">
                {['Excellent', 'Good', 'Average', 'Needs Improvement'].map((rating) => (
                  <div
                    key={rating}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedRating === rating
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRating(rating)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedRating === rating ? 'border-blue-500' : 'border-gray-300'
                        }`}
                      >
                        {selectedRating === rating && (
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{rating}</span>
                          <Badge className={getRatingColor(rating)}>
                            {getRatingLabel(rating)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {rating === 'Excellent' && 'Mastered all concepts, can apply independently'}
                          {rating === 'Good' && 'Understands most concepts, minor guidance needed'}
                          {rating === 'Average' && 'Grasps basic concepts, needs regular practice'}
                          {rating === 'Needs Improvement' && 'Struggling with concepts, requires additional support'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold">Session Comments *</h2>
            </div>
            <Textarea
              placeholder="Describe the student's performance, strengths, areas for improvement, topics covered, homework assigned, etc."
              value={tutorComments}
              onChange={(e) => setTutorComments(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              These comments will be visible to the student and managers.
            </p>
          </CardContent>
        </Card>

        {/* Private Notes */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="private"
                checked={isPrivateNote}
                onCheckedChange={(checked) => setIsPrivateNote(checked as boolean)}
              />
              <Label htmlFor="private" className="text-sm font-medium cursor-pointer">
                Add Private Notes (Tutor & Manager Only)
              </Label>
            </div>
            {isPrivateNote && (
              <p className="text-xs text-purple-700 mt-2 ml-6">
                These notes will only be visible to you and managers, not to students.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setSelectedSession(null)}>
            Cancel
          </Button>
          <Button onClick={handleSaveProgress} className="bg-blue-600 hover:bg-blue-700">
            💾 Save Progress
          </Button>
        </div>
      </div>
    );
  }

  // Show sessions list
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Record Session Progress</h1>
          <p className="text-sm text-gray-500 mt-1">Document student performance and learning outcomes</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sessions
        </Button>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No completed sessions found for this student.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const hasProgress = mockProgressRecords.some(
              p => p.sessionId === session.id && p.studentId === studentId
            );

            return (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-base mb-1">{session.topic}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{session.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{session.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {hasProgress ? (
                      <Button
                        variant="outline"
                        onClick={() => handleRecordClick(session)}
                        className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      >
                        ✏️ Edit
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleRecordClick(session)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        📝 Record
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
