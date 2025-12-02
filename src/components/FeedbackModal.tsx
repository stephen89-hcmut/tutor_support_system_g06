import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { Meeting } from '@/domain/entities/meeting';

interface FeedbackModalProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (meetingId: string, rating: number, comment: string, suggestedTopics?: string) => Promise<void>;
}

export function FeedbackModal({ meeting, isOpen, onClose, onSubmit }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [suggestedTopics, setSuggestedTopics] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!meeting) {
    return null;
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        variant: 'error',
        title: 'Lỗi',
        description: 'Vui lòng chọn đánh giá sao',
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        variant: 'error',
        title: 'Lỗi',
        description: 'Vui lòng nhập nhận xét',
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit(meeting.id, rating, comment, suggestedTopics || undefined);
      toast({
        title: 'Thành công',
        description: 'Cảm ơn bạn đã gửi đánh giá!',
      });
      handleReset();
      onClose();
    } catch (error) {
      toast({
        variant: 'error',
        title: 'Lỗi',
        description: 'Không thể gửi đánh giá. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRating(0);
    setHoverRating(0);
    setComment('');
    setSuggestedTopics('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Đánh giá buổi học</DialogTitle>
          <DialogDescription>
            Chia sẻ ý kiến của bạn về buổi học với {meeting.tutorName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Meeting Info */}
          <div className="bg-gray-50 p-3 rounded-md space-y-1 text-sm">
            <p>
              <strong>Chủ đề:</strong> {meeting.topic}
            </p>
            <p>
              <strong>Tutor:</strong> {meeting.tutorName}
            </p>
            <p>
              <strong>Ngày:</strong> {meeting.date} lúc {meeting.time}
            </p>
          </div>

          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Đánh giá (1-5 sao) *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600">
                Bạn đã chọn: <strong>{rating}/5 sao</strong>
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Nhận xét chi tiết *</Label>
            <Textarea
              id="comment"
              placeholder="Chia sẻ thêm về trải nghiệm của bạn, những điểm mạnh, yếu của tutor, chất lượng giảng dạy, v.v."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">{comment.length}/500</p>
          </div>

          {/* Suggested Topics */}
          <div className="space-y-2">
            <Label htmlFor="topics">Chủ đề muốn học tiếp (tùy chọn)</Label>
            <Input
              id="topics"
              placeholder="VD: Advanced JavaScript, React Hooks, TypeScript, ..."
              value={suggestedTopics}
              onChange={(e) => setSuggestedTopics(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading || rating === 0 || !comment.trim()}>
            {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
