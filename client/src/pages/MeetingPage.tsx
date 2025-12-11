import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Calendar, MapPin, User2, Video } from 'lucide-react';
import { meetingService } from '@/application/services/meetingService';
import { tutorService } from '@/application/services/tutorService';
import { subjectService } from '@/application/services/subjectService';
import type { Meeting } from '@/domain/entities/meeting';
import type { TutorProfile } from '@/domain/entities/tutor';
import type { Subject } from '@/domain/entities/subject';

interface MeetingPageProps {
  onViewTutorProfile?: (tutorId: string) => void;
}

const ACTIVE_STATUSES: Meeting['status'][] = ['Open', 'Full', 'In Progress'];

const formatDate = (meeting: Meeting) => {
  const start = meeting.time ? new Date(meeting.time) : meeting.date ? new Date(meeting.date) : null;
  if (!start || isNaN(start.getTime())) return meeting.date;
  return start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatTime = (meeting: Meeting) => {
  const start = meeting.time ? new Date(meeting.time) : meeting.date ? new Date(meeting.date) : null;
  if (!start || isNaN(start.getTime())) return meeting.time;
  return start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

export function MeetingPage({ onViewTutorProfile }: MeetingPageProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [meetingList, tutorList, subjectList] = await Promise.all([
          meetingService.getAll(),
          tutorService.list(),
          subjectService.list(),
        ]);
        if (!mounted) return;
        setMeetings(meetingList.filter((m) => ACTIVE_STATUSES.includes(m.status)));
        setTutors(tutorList);
        setSubjects(subjectList);
      } catch (err) {
        if (!mounted) return;
        setError('Could not load meetings.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      if (selectedTutor !== 'all' && m.tutorId !== selectedTutor) return false;
      if (selectedSubject !== 'all') {
        const subject = subjects.find((s) => s.id === selectedSubject);
        if (subject) {
          const topic = (m.topic || '').toLowerCase();
          if (!topic.includes(subject.code.toLowerCase()) && !topic.includes(subject.name.toLowerCase())) {
            return false;
          }
        }
      }
      return true;
    });
  }, [meetings, selectedTutor, selectedSubject, subjects]);

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Dang tai meeting...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-muted-foreground">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meetings</h1>
          <p className="text-muted-foreground">Cac buoi hoc dang mo (Open / Full / In Progress).</p>
        </div>
        <Badge variant="outline" className="text-base px-3 py-1">Meetings ({filteredMeetings.length})</Badge>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tutor</label>
              <Select value={selectedTutor} onValueChange={setSelectedTutor}>
                <SelectTrigger>
                  <SelectValue placeholder="All tutors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {tutors.map((tutor) => (
                    <SelectItem key={tutor.id} value={tutor.id}>{tutor.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => { setSelectedTutor('all'); setSelectedSubject('all'); }}>
              Clear filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {filteredMeetings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">Khong co meeting phu hop.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMeetings.map((meeting) => {
            const occupancy = meeting.currentCount ?? 0;
            const capacity = meeting.maxCapacity && meeting.maxCapacity > 0 ? meeting.maxCapacity : 1;
            const progress = Math.min(100, (occupancy / capacity) * 100);
            return (
              <Card key={meeting.id} className="h-full">
                <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg line-clamp-2">{meeting.topic || 'Meeting'}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(meeting)} • {formatTime(meeting)}</span>
                    </div>
                  </div>
                  <Badge variant="outline">{meeting.status}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User2 className="h-4 w-4" />
                    <span>{meeting.tutorName || 'Tutor'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {meeting.mode === 'In-Person' ? <MapPin className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                    <span>{meeting.mode === 'In-Person' ? meeting.location || 'Offline' : meeting.mode}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Group size</span>
                      <span>{occupancy}/{capacity}</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                  {onViewTutorProfile && meeting.tutorId && (
                    <Button variant="outline" size="sm" onClick={() => onViewTutorProfile(meeting.tutorId)}>
                      Xem ho so tutor
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
