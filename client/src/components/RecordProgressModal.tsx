import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { Meeting } from '@/domain/entities/meeting';
import type { ProgressRecord } from '@/domain/entities/progress';

interface RecordProgressModalProps {
  meeting: Meeting;
  onSave: (data: Partial<ProgressRecord>) => Promise<void>;
  onCancel: () => void;
}

export function RecordProgressModal({ meeting, onSave, onCancel }: RecordProgressModalProps) {
  const [attendance, setAttendance] = useState<'Present' | 'Absent'>('Present');
  const [absenceReason, setAbsenceReason] = useState('');
  const [understanding, setUnderstanding] = useState(75);
  const [problemSolving, setProblemSolving] = useState(75);
  const [codeQuality, setCodeQuality] = useState(75);
  const [participation, setParticipation] = useState(75);
  const [tutorComments, setTutorComments] = useState('');
  const [privateNote, setPrivateNote] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);

  const calculateOverallRating = () => {
    const avg = (understanding + problemSolving + codeQuality + participation) / 4;
    if (avg >= 80) return 'Excellent';
    if (avg >= 60) return 'Good';
    if (avg >= 40) return 'Average';
    return 'Needs Improvement';
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        attendance,
        absenceReason: attendance === 'Absent' ? absenceReason : undefined,
        understanding: attendance === 'Present' ? understanding : 0,
        problemSolving: attendance === 'Present' ? problemSolving : 0,
        codeQuality: attendance === 'Present' ? codeQuality : 0,
        participation: attendance === 'Present' ? participation : 0,
        overallRating: attendance === 'Present' ? calculateOverallRating() : 'Average',
        tutorComments,
        privateNote: isPrivate ? privateNote : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <CardTitle>Record Student Progress</CardTitle>
          <div className="text-sm text-muted-foreground mt-2">
            <div>
              <strong>Student:</strong> {meeting.studentName}
            </div>
            <div>
              <strong>Date:</strong> {meeting.date} | <strong>Topic:</strong> {meeting.topic}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Attendance Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Attendance</Label>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="present"
                  value="Present"
                  checked={attendance === 'Present'}
                  onChange={(e) => setAttendance(e.target.value as any)}
                  className="w-4 h-4"
                />
                <label htmlFor="present" className="cursor-pointer">
                  Present
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="absent"
                  value="Absent"
                  checked={attendance === 'Absent'}
                  onChange={(e) => setAttendance(e.target.value as any)}
                  className="w-4 h-4"
                />
                <label htmlFor="absent" className="cursor-pointer">
                  Absent
                </label>
              </div>
            </div>

            {attendance === 'Absent' && (
              <Textarea
                placeholder="Reason for absence..."
                value={absenceReason}
                onChange={(e) => setAbsenceReason(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {/* Performance Metrics */}
          {attendance === 'Present' && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
              <Label className="text-base font-semibold">Performance Metrics (0-100)</Label>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Understanding</label>
                  <Badge variant="outline">{understanding}%</Badge>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={understanding}
                  onChange={(e) => setUnderstanding(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Problem Solving</label>
                  <Badge variant="outline">{problemSolving}%</Badge>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={problemSolving}
                  onChange={(e) => setProblemSolving(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Code Quality</label>
                  <Badge variant="outline">{codeQuality}%</Badge>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={codeQuality}
                  onChange={(e) => setCodeQuality(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Participation</label>
                  <Badge variant="outline">{participation}%</Badge>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={participation}
                  onChange={(e) => setParticipation(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="mt-4 p-3 bg-white rounded border">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Overall Rating:</span>
                  <Badge
                    className={
                      calculateOverallRating() === 'Excellent'
                        ? 'bg-green-500'
                        : calculateOverallRating() === 'Good'
                          ? 'bg-blue-500'
                          : 'bg-yellow-500'
                    }
                  >
                    {calculateOverallRating()}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="space-y-3">
            <Label htmlFor="tutorComments" className="text-base font-semibold">
              Tutor Comments
            </Label>
            <Textarea
              id="tutorComments"
              placeholder="Share your observations and feedback..."
              value={tutorComments}
              onChange={(e) => setTutorComments(e.target.value)}
              className="min-h-24"
            />
          </div>

          {/* Private Note */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox id="isPrivate" checked={isPrivate} onCheckedChange={(checked) => setIsPrivate(Boolean(checked))} />
              <Label htmlFor="isPrivate" className="font-semibold cursor-pointer">
                Add Private Note (only visible to tutor)
              </Label>
            </div>
            {isPrivate && (
              <Textarea
                placeholder="Private note..."
                value={privateNote}
                onChange={(e) => setPrivateNote(e.target.value)}
                className="min-h-20"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RecordProgressModal;
