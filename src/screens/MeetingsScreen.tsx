import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CancelMeetingModal } from '@/components/CancelMeetingModal';
import { RescheduleMeetingScreen } from './RescheduleMeetingScreen';
import { mockMeetings, Meeting, MeetingStatus } from '@/data/mockMeetings';
import { Calendar, Video, MapPin, MoreVertical, X } from 'lucide-react';

interface MeetingsScreenProps {
  onReschedule: (meetingId: string) => void;
  onCancel: (meetingId: string, cancelledBy: string, reason: string) => void;
}

export function MeetingsScreen({
  onReschedule,
  onCancel,
}: MeetingsScreenProps) {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [rescheduleMeeting, setRescheduleMeeting] = useState<Meeting | null>(null);
  const [activeTab, setActiveTab] = useState<MeetingStatus>('Scheduled');

  const meetingsByStatus = useMemo(() => {
    return {
      Scheduled: mockMeetings.filter(m => m.status === 'Scheduled'),
      Completed: mockMeetings.filter(m => m.status === 'Completed'),
      Cancelled: mockMeetings.filter(m => m.status === 'Cancelled'),
    };
  }, []);

  const handleRescheduleClick = (meeting: Meeting) => {
    setRescheduleMeeting(meeting);
  };

  const handleCancelClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowCancelModal(true);
  };

  const handleRescheduleComplete = (meetingId: string, newDate: string, newTime: string) => {
    // Update meeting in mock data
    const meeting = mockMeetings.find(m => m.id === meetingId);
    if (meeting) {
      meeting.date = newDate;
      meeting.time = newTime;
    }
    setRescheduleMeeting(null);
  };

  const handleCancelComplete = (meetingId: string, cancelledBy: string, reason: string) => {
    onCancel(meetingId, cancelledBy as any, reason);
    setShowCancelModal(false);
    setSelectedMeeting(null);
  };

  const getModeIcon = (mode: string) => {
    if (mode === 'Zoom' || mode === 'Teams') {
      return <Video className="h-4 w-4" />;
    }
    return <MapPin className="h-4 w-4" />;
  };

  const getModeDisplay = (meeting: Meeting) => {
    if (meeting.mode === 'In-Person') {
      return meeting.location || 'In-Person';
    }
    return `${meeting.mode} Link`;
  };

  // If rescheduling, show reschedule screen
  if (rescheduleMeeting) {
    return (
      <RescheduleMeetingScreen
        meeting={rescheduleMeeting}
        onBack={() => setRescheduleMeeting(null)}
        onReschedule={handleRescheduleComplete}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meetings</h1>
          <p className="text-muted-foreground">Manage your scheduled meetings</p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark">
          <Calendar className="mr-2 h-4 w-4" />
          Book New Meeting
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as MeetingStatus)}>
        <TabsList>
          <TabsTrigger value="Scheduled">
            Upcoming ({meetingsByStatus.Scheduled.length})
          </TabsTrigger>
          <TabsTrigger value="Completed">
            Completed ({meetingsByStatus.Completed.length})
          </TabsTrigger>
          <TabsTrigger value="Cancelled">
            Cancelled ({meetingsByStatus.Cancelled.length})
          </TabsTrigger>
        </TabsList>

        {(['Scheduled', 'Completed', 'Cancelled'] as MeetingStatus[]).map((status) => (
          <TabsContent key={status} value={status}>
            <Card>
              <CardHeader>
                <CardTitle>{status} Meetings</CardTitle>
              </CardHeader>
              <CardContent>
                {meetingsByStatus[status].length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No {status.toLowerCase()} meetings
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Tutor</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Status</TableHead>
                        {status === 'Scheduled' && <TableHead className="text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meetingsByStatus[status].map((meeting) => (
                        <TableRow key={meeting.id}>
                          <TableCell>
                            {meeting.date} at {meeting.time}
                          </TableCell>
                          <TableCell>{meeting.studentName}</TableCell>
                          <TableCell>{meeting.tutorName}</TableCell>
                          <TableCell>{meeting.topic}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getModeIcon(meeting.mode)}
                              <span>{getModeDisplay(meeting)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                meeting.status === 'Scheduled'
                                  ? 'default'
                                  : meeting.status === 'Completed'
                                  ? 'success'
                                  : 'destructive'
                              }
                            >
                              {meeting.status}
                            </Badge>
                          </TableCell>
                          {status === 'Scheduled' && (
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRescheduleClick(meeting)}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Reschedule
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancelClick(meeting)}
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Cancel
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleRescheduleClick(meeting)}>
                                      Reschedule
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleCancelClick(meeting)}>
                                      Cancel
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <CancelMeetingModal
        meeting={selectedMeeting}
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        onCancel={handleCancelComplete}
      />
    </div>
  );
}

