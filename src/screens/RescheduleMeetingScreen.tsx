import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, AlertTriangle, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { mockMeetings, Meeting } from '@/data/mockMeetings';
import { notificationManager } from '@/services/NotificationSystem';

interface RescheduleMeetingScreenProps {
  meeting: Meeting;
  onBack: () => void;
  onReschedule: (meetingId: string, newDate: string, newTime: string) => void;
}

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
];

export function RescheduleMeetingScreen({
  meeting,
  onBack,
  onReschedule,
}: RescheduleMeetingScreenProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  const checkForConflicts = (date: string, time: string): boolean => {
    // Check if the selected date and time conflicts with any existing scheduled meeting
    const conflictingMeeting = mockMeetings.find(
      (m) =>
        m.id !== meeting.id &&
        m.status === 'Scheduled' &&
        m.date === date &&
        m.time === time &&
        (m.studentId === meeting.studentId || m.tutorId === meeting.tutorId)
    );

    return !!conflictingMeeting;
  };

  const handleTimeSlotClick = (time: string) => {
    if (!selectedDate) {
      toast({
        variant: 'error',
        title: 'Please select a date first',
        description: 'You need to select a date before choosing a time slot.',
      });
      return;
    }

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const hasConflict = checkForConflicts(dateString, time);

    if (hasConflict) {
      toast({
        variant: 'error',
        title: 'Trùng lịch',
        description: 'This time slot conflicts with an existing meeting. Please choose another time.',
      });
      setSelectedTime('');
      return;
    }

    setSelectedTime(time);
  };

  const handleConfirmClick = () => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const hasConflict = checkForConflicts(dateString, selectedTime);

    if (hasConflict) {
      toast({
        variant: 'error',
        title: 'Trùng lịch',
        description: 'This time slot conflicts with an existing meeting. Please choose another time.',
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleFinalConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    onReschedule(meeting.id, dateString, selectedTime);

    // Send notifications
    const studentMessage = `Your meeting has been rescheduled to ${dateString} at ${selectedTime}. Original time: ${meeting.date} at ${meeting.time}`;
    const tutorMessage = `Meeting with ${meeting.studentName} has been rescheduled to ${dateString} at ${selectedTime}. Original time: ${meeting.date} at ${meeting.time}`;

    await notificationManager.sendMultiChannel(
      meeting.studentName,
      studentMessage,
      'Meeting Rescheduled'
    );

    await notificationManager.sendMultiChannel(
      meeting.tutorName,
      tutorMessage,
      'Meeting Rescheduled'
    );

    setShowConfirmDialog(false);
    onBack();
  };

  const hasConflict = selectedDate && selectedTime
    ? checkForConflicts(format(selectedDate, 'yyyy-MM-dd'), selectedTime)
    : false;

  const canConfirm = selectedDate && selectedTime && !hasConflict;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Reschedule Meeting</h1>
          <p className="text-muted-foreground">Change the date and time of your meeting</p>
        </div>
      </div>

      {/* Original Meeting Info */}
      <Card>
        <CardHeader>
          <CardTitle>Original Meeting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
              <p className="text-sm">{meeting.date} at {meeting.time}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Student</p>
              <p className="text-sm">{meeting.studentName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tutor</p>
              <p className="text-sm">{meeting.tutorName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Topic</p>
              <p className="text-sm">{meeting.topic}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Select New Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Time Slot Selection */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Select New Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((time) => {
                const dateString = format(selectedDate, 'yyyy-MM-dd');
                const isSelected = selectedTime === time;
                const isConflict = checkForConflicts(dateString, time);

                return (
                  <Button
                    key={time}
                    variant={isSelected ? 'default' : 'outline'}
                    className={isConflict ? 'border-red-500 text-red-700 hover:bg-red-50' : ''}
                    onClick={() => handleTimeSlotClick(time)}
                    disabled={isConflict}
                  >
                    {time}
                    {isConflict && (
                      <AlertTriangle className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conflict Alert */}
      {hasConflict && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Conflict Detected</AlertTitle>
          <AlertDescription>
            This time slot conflicts with an existing meeting. Please choose another time.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirmClick}
          disabled={!canConfirm}
        >
          Confirm Reschedule
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Reschedule</DialogTitle>
            <DialogDescription>
              Please review the changes before confirming.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Old Meeting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Date & Time</p>
                    <p>{meeting.date} at {meeting.time}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Student</p>
                    <p>{meeting.studentName}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Tutor</p>
                    <p>{meeting.tutorName}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Topic</p>
                    <p>{meeting.topic}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">New Meeting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Date & Time</p>
                    <p>
                      {selectedDate && format(selectedDate, 'yyyy-MM-dd')} at {selectedTime}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Student</p>
                    <p>{meeting.studentName}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Tutor</p>
                    <p>{meeting.tutorName}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Topic</p>
                    <p>{meeting.topic}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleFinalConfirm}>
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

