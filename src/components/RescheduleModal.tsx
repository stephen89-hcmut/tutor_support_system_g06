import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { Meeting } from '@/domain/entities/meeting';
import { meetingService } from '@/application/services/meetingService';

interface RescheduleModalProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (meetingId: string, newDate: string, newTime: string) => void;
}

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
];

function RescheduleModalContent({
  meeting,
  isOpen,
  onClose,
  onReschedule,
}: RescheduleModalProps & { meeting: Meeting }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [existingMeetings, setExistingMeetings] = useState<Meeting[]>([]);
  const [conflictError, setConflictError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    const loadMeetings = async () => {
      try {
        const data = await meetingService.getAll();
        if (!mounted) return;
        setExistingMeetings(data);
      } catch (err) {
        // ignore
      }
    };
    if (isOpen) {
      loadMeetings();
    }
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  const checkForConflicts = (date: string, time: string): { hasConflict: boolean; conflictingMeeting?: Meeting } => {
    const conflictingMeeting = existingMeetings.find(
      (m) =>
        m.id !== meeting.id &&
        m.status === 'Scheduled' &&
        m.date === date &&
        m.time === time &&
        (m.studentId === meeting.studentId || m.tutorId === meeting.tutorId)
    );

    return {
      hasConflict: !!conflictingMeeting,
      conflictingMeeting,
    };
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime('');
    setConflictError('');
  };

  const handleTimeSlotClick = (time: string) => {
    if (!selectedDate) {
      setConflictError('Vui lòng chọn ngày trước');
      return;
    }

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const conflict = checkForConflicts(dateString, time);

    if (conflict.hasConflict) {
      const conflicting = conflict.conflictingMeeting;
      setConflictError(
        `⚠️ Trùng lịch với buổi học "${conflicting?.topic || 'Unknown'}" lúc ${conflicting?.time}`
      );
      setSelectedTime('');
      return;
    }

    setSelectedTime(time);
    setConflictError('');
  };

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      setConflictError('Vui lòng chọn ngày và giờ mới');
      return;
    }

    setLoading(true);
    try {
      const newDate = format(selectedDate, 'yyyy-MM-dd');
      await onReschedule(meeting.id, newDate, selectedTime);
      toast({
        title: 'Thành công',
        description: 'Buổi học đã được dời lịch thành công',
      });
      onClose();
    } catch (error) {
      toast({
        variant: 'error',
        title: 'Lỗi',
        description: 'Không thể dời lịch buổi học',
      });
    } finally {
      setLoading(false);
    }
  };

  const isDateValid = (date: Date): boolean => {
    return date > new Date();
  };

  const isTimeSlotAvailable = (time: string): boolean => {
    if (!selectedDate) return false;
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const conflict = checkForConflicts(dateString, time);
    return !conflict.hasConflict;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dời lịch buổi học</DialogTitle>
          <DialogDescription>
            Chọn ngày và giờ mới cho buổi học: <strong>{meeting.topic}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Date Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Ngày mới (phải sau hôm nay)
            </label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => !isDateValid(date)}
              className="rounded-md border"
            />
            {selectedDate && (
              <p className="text-xs text-gray-600">
                Ngày được chọn: <strong>{format(selectedDate, 'dd/MM/yyyy')}</strong>
              </p>
            )}
          </div>

          {/* Time Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Giờ mới
            </label>
            {!selectedDate ? (
              <div className="text-xs text-gray-500 p-4 border border-dashed rounded">
                Vui lòng chọn ngày trước
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimeSlotClick(time)}
                    className={`text-xs ${
                      !isTimeSlotAvailable(time) && selectedTime !== time
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    disabled={!isTimeSlotAvailable(time) && selectedTime !== time}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            )}
            {selectedTime && (
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                <CheckCircle className="w-4 h-4" />
                Giờ được chọn: <strong>{selectedTime}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Conflict Warning */}
        {conflictError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Cảnh báo</AlertTitle>
            <AlertDescription>{conflictError}</AlertDescription>
          </Alert>
        )}

        {/* Current Meeting Info */}
        <div className="bg-gray-50 p-3 rounded-md text-xs space-y-1">
          <p>
            <strong>Buổi học hiện tại:</strong> {meeting.topic}
          </p>
          <p>
            <strong>Ngày giờ cũ:</strong> {meeting.date} lúc {meeting.time}
          </p>
          {selectedDate && selectedTime && (
            <p className="text-green-600">
              <strong>Ngày giờ mới:</strong> {format(selectedDate, 'dd/MM/yyyy')} lúc {selectedTime}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={!selectedDate || !selectedTime || !!conflictError || loading}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận dời lịch'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RescheduleModal(props: RescheduleModalProps) {
  if (!props.meeting) {
    return null;
  }

  return <RescheduleModalContent {...props} meeting={props.meeting} />;
}
