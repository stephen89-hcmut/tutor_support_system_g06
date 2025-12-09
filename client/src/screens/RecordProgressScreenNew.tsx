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

interface RecordProgressPageNewProps {
  studentId: string;
  onBack: () => void;
}

export function RecordProgressPageNew({
  studentId,
  onBack,
}: RecordProgressPageNewProps) {
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

  if (loading) {
    return <div className="p-6 text-center">Loading sessions...</div>;
  }

  // Show form when session is selected
  if (selectedSession) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <Button
              variant="ghost"
              onClick={() => setSelectedSession(null)}
              className="text-blue-600 hover:bg-blue-50 px-0 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sessions
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

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
                    {studentAccount?.username.substring(0, 1).toUpperCase()}
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
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Understanding of Concepts</Label>
                    <span className="text-sm font-bold text-blue-600">{understanding}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={understanding}
                    onChange={(e) => setUnderstanding(Number(e.target.value))}
                    className="w-full h-2 bg-blue-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">Needs Work</span>
                    <span className="text-xs text-gray-500">Excellent</span>
                  </div>
                </div>

                {/* Problem Solving */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Problem Solving Skills</Label>
                    <span className="text-sm font-bold text-blue-600">{problemSolving}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={problemSolving}
                    onChange={(e) => setProblemSolving(Number(e.target.value))}
                    className="w-full h-2 bg-blue-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">Needs Work</span>
                    <span className="text-xs text-gray-500">Excellent</span>
                  </div>
                </div>

                {/* Code Quality */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Code Quality & Best Practices</Label>
                    <span className="text-sm font-bold text-blue-600">{codeQuality}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={codeQuality}
                    onChange={(e) => setCodeQuality(Number(e.target.value))}
                    className="w-full h-2 bg-blue-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">Needs Work</span>
                    <span className="text-xs text-gray-500">Excellent</span>
                  </div>
                </div>

                {/* Participation */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Class Participation & Engagement</Label>
                    <span className="text-sm font-bold text-blue-600">{participation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={participation}
                    onChange={(e) => setParticipation(Number(e.target.value))}
                    className="w-full h-2 bg-blue-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">Needs Work</span>
                    <span className="text-xs text-gray-500">Excellent</span>
                  </div>
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
                {[
                  { label: 'Excellent', range: '90-100%', color: 'bg-green-100 border-green-300', textColor: 'text-green-700' },
                  { label: 'Good', range: '70-89%', color: 'bg-blue-100 border-blue-300', textColor: 'text-blue-700' },
                  { label: 'Average', range: '50-69%', color: 'bg-amber-100 border-amber-300', textColor: 'text-amber-700' },
                  { label: 'Needs Improvement', range: '<50%', color: 'bg-red-100 border-red-300', textColor: 'text-red-700' }
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedRating === item.label
                        ? `border-gray-400 ${item.color}`
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    onClick={() => setSelectedRating(item.label)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedRating === item.label ? 'border-gray-700' : 'border-gray-300'
                        }`}
                      >
                        {selectedRating === item.label && (
                          <div className="w-3 h-3 rounded-full bg-gray-700" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.label}</span>
                          <Badge className={`${item.color} ${item.textColor}`}>
                            {item.range}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.label === 'Excellent' && 'Mastered all concepts, can apply independently'}
                          {item.label === 'Good' && 'Understands most concepts, minor guidance needed'}
                          {item.label === 'Average' && 'Grasps basic concepts, needs regular practice'}
                          {item.label === 'Needs Improvement' && 'Struggling with concepts, requires additional support'}
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
        <div className="flex justify-end gap-3 pb-8">
          <Button variant="outline" onClick={() => setSelectedSession(null)}>
            Cancel
          </Button>
          <Button onClick={handleSaveProgress} className="bg-blue-600 hover:bg-blue-700">
            💾 Save Progress
          </Button>
        </div>
        </div>
      </div>
    );
  }

  // Show sessions list
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Students</span>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-900 font-medium">Record Progress - {studentAccount?.username}</span>
          </div>
          <Button variant="ghost" onClick={onBack} className="text-blue-600 hover:bg-blue-50 px-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Student Info Card */}
        <Card className="mb-8 bg-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-pink-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-semibold text-pink-700">
                    {studentAccount?.username.substring(0, 1).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">{studentAccount?.username || 'Student'}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>ID: {studentAccount?.studentId || 'N/A'}</span>
                    <span>•</span>
                    <span>Computer Science</span>
                    <span>•</span>
                    <span>Year 3</span>
                  </div>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                Active Student
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Completed Sessions Section */}
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Completed Sessions</h3>
            <p className="text-sm text-gray-600">Select a session to record or update progress</p>
          </div>

          {sessions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">No completed sessions found for this student.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sessions.map((session, index) => {
                const hasProgress = mockProgressRecords.some(
                  p => p.sessionId === session.id && p.studentId === studentId
                );

                return (
                  <Card 
                    key={session.id} 
                    className="bg-white hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <BookOpen className="h-5 w-5 text-yellow-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-2">{session.topic}</h4>
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>{session.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>{session.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {hasProgress ? (
                            <>
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                ✓ Progress Recorded
                              </Badge>
                              <Button
                                onClick={() => handleRecordClick(session)}
                                variant="outline"
                                className="text-gray-700 hover:bg-gray-50"
                              >
                                Edit
                              </Button>
                            </>
                          ) : (
                            <>
                              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                                No Progress Yet
                              </Badge>
                              <Button
                                onClick={() => handleRecordClick(session)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Record
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Upcoming Sessions Info */}
          {sessions.length > 0 && (
            <Card className="mt-8 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">Upcoming Sessions</span>
                    </p>
                    <p className="text-sm text-blue-700 mt-1">You can record progress after the session is completed.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
