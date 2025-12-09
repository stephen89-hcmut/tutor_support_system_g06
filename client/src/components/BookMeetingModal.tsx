import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { Meeting, MeetingMode } from '@/domain/entities/meeting';
import type { TutorProfile } from '@/domain/entities/tutor';
import { meetingService } from '@/application/services/meetingService';
import { notificationManager } from '@/services/NotificationSystem';
import { useRole } from '@/contexts/RoleContext';
import { cn } from '@/lib/utils';

interface BookMeetingModalProps {
  tutor: TutorProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookComplete: () => void;
}

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
];

export function BookMeetingModal({
  tutor,
  open,
  onOpenChange,
  onBookComplete,
}: BookMeetingModalProps) {
  const { userId, userName } = useRole();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [meetingMode, setMeetingMode] = useState<MeetingMode>('Zoom');
  const [duration, setDuration] = useState<string>('30');
  const [notes, setNotes] = useState('');
  const [topic, setTopic] = useState('');
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [existingMeetings, setExistingMeetings] = useState<Meeting[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    const loadMeetings = async () => {
      try {
        const data = await meetingService.getAll();
        if (!mounted) return;
        setExistingMeetings(data);
      } catch (err) {
        // ignore for now
      }
    };
    loadMeetings();
    return () => {
      mounted = false;
    };
  }, []);

  // Check for conflicts (UCB1.1 - Normal Flow step 6)
  const checkForConflicts = (date: string, time: string): boolean => {
    // Check if student or tutor already has a meeting at this time
    const conflictingMeeting = existingMeetings.find(
      (m) =>
        m.status === 'Scheduled' &&
        m.date === date &&
        m.time === time &&
        (m.studentId === userId || m.tutorId === tutor.id)
    );

    return !!conflictingMeeting;
  };

  const handleTimeSlotClick = (time: string) => {
    if (!selectedDate) {
      toast({
        variant: 'destructive',
        title: 'Please select a date first',
        description: 'You need to select a date before choosing a time slot.',
      });
      return;
    }

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const hasConflict = checkForConflicts(dateString, time);

    if (hasConflict) {
      setConflictError('Thời gian này đã bị trùng lịch. Vui lòng chọn thời gian khác.');
      setSelectedTime('');
      return;
    }

    setConflictError(null);
    setSelectedTime(time);
  };

  const handleBook = async () => {
    // Validation
    if (!selectedDate || !selectedTime) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select both date and time for the meeting.',
      });
      return;
    }

    if (!topic.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Topic',
        description: 'Please enter a topic for the meeting.',
      });
      return;
    }

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const hasConflict = checkForConflicts(dateString, selectedTime);

    if (hasConflict) {
      setConflictError('Thời gian này đã bị trùng lịch. Vui lòng chọn thời gian khác.');
      toast({
        variant: 'destructive',
        title: 'Trùng lịch',
        description: 'Thời gian này đã bị trùng lịch. Vui lòng chọn thời gian khác.',
      });
      return;
    }

    setIsBooking(true);

    try {
      // Create new meeting (UCB1.1 - Normal Flow step 7)
      const newMeeting: Meeting = {
        id: `m${Date.now()}`,
        date: dateString,
        time: selectedTime,
        studentId: userId || 's1',
        studentName: userName || 'Current Student',
        tutorId: tutor.id,
        tutorName: tutor.name,
        topic: topic.trim(),
        mode: meetingMode,
        status: 'Scheduled',
        notes: notes.trim() || undefined,
        link: meetingMode !== 'In-Person' ? `https://meet.google.com/${Math.random().toString(36).substring(7)}` : undefined,
        location: meetingMode === 'In-Person' ? 'HCMUT Campus' : undefined,
      };

      await meetingService.schedule(newMeeting);
      setExistingMeetings((prev) => [...prev, newMeeting]);

      // Send notification (UCB1.3 - SendNotification)
      await notificationManager.sendNotification(
        'email',
        tutor.id,
        `Student has booked a meeting with you on ${format(selectedDate, 'MMM d, yyyy')} at ${selectedTime}`,
        'New Meeting Booked',
      );

      // Also notify student
      await notificationManager.sendNotification(
        'email',
        userId || 's1',
        `Your meeting with ${tutor.name} has been confirmed for ${format(selectedDate, 'MMM d, yyyy')} at ${selectedTime}`,
        'Meeting Confirmation',
      );

      toast({
        title: 'Meeting Booked Successfully',
        description: `Your meeting with ${tutor.name} has been confirmed.`,
      });

      // Reset form
      setSelectedDate(undefined);
      setSelectedTime('');
      setTopic('');
      setNotes('');
      setConflictError(null);
      onBookComplete();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: 'Đặt lịch thất bại. Vui lòng thử lại sau.',
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleClose = () => {
    setSelectedDate(undefined);
    setSelectedTime('');
    setTopic('');
    setNotes('');
    setConflictError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Your Meeting</DialogTitle>
          <DialogDescription>
            Select date, time, and meeting details to confirm your booking.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Left Column - Tutor Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{tutor.name}</h3>
                  <p className="text-sm text-muted-foreground">{tutor.specialization}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm">{tutor.rating} ({tutor.reviewCount})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tutor.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Email: {tutor.id}@hcmut.edu.vn</p>
                  <p>Sessions: {tutor.sessionCount}</p>
                </div>
                <Button variant="outline" className="w-full" onClick={handleClose}>
                  Change Tutor
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Booking Details */}
          <div className="space-y-6">
            {/* Select Date & Time */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Select Date & Time</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
                {selectedDate && (
                  <div className="mt-4">
                    <Label className="mb-2 block">Select Time</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map((time) => {
                        const dateString = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
                        const hasConflict = dateString ? checkForConflicts(dateString, time) : false;
                        const isSelected = selectedTime === time;

                        return (
                          <button
                            key={time}
                            onClick={() => handleTimeSlotClick(time)}
                            disabled={hasConflict}
                            className={cn(
                              'px-3 py-2 text-sm rounded border transition-colors',
                              isSelected
                                ? 'bg-primary text-primary-foreground border-primary'
                                : hasConflict
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white hover:bg-primary/10 border-gray-200'
                            )}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                    {conflictError && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{conflictError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Booking Details</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="gmt+7">
                      <SelectTrigger id="timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gmt+7">(GMT+7) Ho Chi Minh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger id="duration">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic">Meeting Topic</Label>
                    <Input
                      id="topic"
                      placeholder="Enter meeting topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Meeting Mode</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={meetingMode === 'Zoom' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMeetingMode('Zoom')}
                      >
                        Online
                      </Button>
                      <Button
                        type="button"
                        variant={meetingMode === 'In-Person' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMeetingMode('In-Person')}
                      >
                        In-person
                      </Button>
                    </div>
                  </div>

                  {meetingMode !== 'In-Person' && (
                    <div className="space-y-2">
                      <Label htmlFor="meetingLink">Meeting Link</Label>
                      <Input
                        id="meetingLink"
                        placeholder="https://meet.google.com/..."
                        value={meetingMode === 'Zoom' ? `https://meet.google.com/${Math.random().toString(36).substring(7)}` : ''}
                        readOnly
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional information or special requirements..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isBooking}>
            Back
          </Button>
          <Button
            onClick={handleBook}
            disabled={isBooking || !selectedDate || !selectedTime || !topic.trim() || !!conflictError}
            className="bg-primary hover:bg-primary-dark"
          >
            {isBooking ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

