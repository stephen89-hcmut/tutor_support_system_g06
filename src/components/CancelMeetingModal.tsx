import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { notificationManager } from '@/services/NotificationSystem';
import { Meeting, CancelledBy } from '@/data/mockMeetings';

interface CancelMeetingModalProps {
  meeting: Meeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (meetingId: string, cancelledBy: CancelledBy, reason: string) => void;
}

export function CancelMeetingModal({
  meeting,
  open,
  onOpenChange,
  onCancel,
}: CancelMeetingModalProps) {
  const [cancelledBy, setCancelledBy] = useState<CancelledBy>('Tutor');
  const [reason, setReason] = useState('');
  const [notifyUsers, setNotifyUsers] = useState(true);

  if (!meeting) return null;

  const handleCancel = async () => {
    if (!reason.trim()) {
      return;
    }

    // Update meeting status
    onCancel(meeting.id, cancelledBy, reason);

    // Send notifications if enabled
    if (notifyUsers) {
      const studentMessage = `Your meeting on ${meeting.date} at ${meeting.time} has been cancelled. Reason: ${reason}`;
      const tutorMessage = `Meeting with ${meeting.studentName} on ${meeting.date} at ${meeting.time} has been cancelled. Reason: ${reason}`;

      await notificationManager.sendMultiChannel(
        meeting.studentName,
        studentMessage,
        'Meeting Cancelled'
      );

      await notificationManager.sendMultiChannel(
        meeting.tutorName,
        tutorMessage,
        'Meeting Cancelled'
      );
    }

    // Reset form
    setReason('');
    setCancelledBy('Tutor');
    setNotifyUsers(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Meeting</DialogTitle>
          <DialogDescription>
            Cancel the meeting with {meeting.studentName} on {meeting.date} at {meeting.time}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cancelled-by">Cancelled By</Label>
            <Select
              value={cancelledBy}
              onValueChange={(value) => setCancelledBy(value as CancelledBy)}
            >
              <SelectTrigger id="cancelled-by">
                <SelectValue placeholder="Select who cancelled" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Tutor">Tutor</SelectItem>
                <SelectItem value="System">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notify" className="flex flex-col space-y-1">
              <span>Notify Student & Tutor</span>
              <span className="text-xs text-muted-foreground">
                Send email and push notifications
              </span>
            </Label>
            <Switch
              id="notify"
              checked={notifyUsers}
              onCheckedChange={setNotifyUsers}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={handleCancel}
            variant="destructive"
            disabled={!reason.trim()}
          >
            Cancel Meeting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

