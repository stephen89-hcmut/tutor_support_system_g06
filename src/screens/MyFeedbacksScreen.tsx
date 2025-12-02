import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { meetingFeedbackService } from '@/application/services/meetingFeedbackService';

interface StudentFeedback {
  id: string;
  meetingId: string;
  tutorId: string;
  tutorName?: string;
  rating: number;
  comment: string;
  suggestedTopics?: string;
  createdAt: string;
}

interface MyFeedbacksScreenProps {
  onBack: () => void;
}

export function MyFeedbacksScreen({ onBack }: MyFeedbacksScreenProps) {
  const { userId } = useRole();
  const [feedbacks, setFeedbacks] = useState<StudentFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeedbacks = async () => {
      if (!userId) return;
      try {
        const studentFeedbacks = await meetingFeedbackService.getFeedbackByStudent(userId);
        setFeedbacks(studentFeedbacks as unknown as StudentFeedback[]);
      } catch (error) {
        console.error('Failed to load feedbacks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeedbacks();
  }, [userId]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Các đánh giá của tôi</h1>
          <p className="text-muted-foreground">Xem các đánh giá bạn đã gửi cho các tutor</p>
        </div>
      </div>

      {/* Feedbacks List */}
      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Bạn chưa gửi đánh giá cho tutor nào.
            </CardContent>
          </Card>
        ) : (
          feedbacks.map((feedback) => (
            <Card key={feedback.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">Tutor ID: {feedback.tutorId}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      {renderStars(feedback.rating)}
                      <span className="font-semibold">{feedback.rating}/5 sao</span>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(feedback.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <p className="text-gray-700 leading-relaxed">{feedback.comment}</p>

                {feedback.suggestedTopics && (
                  <div className="bg-green-50 p-3 rounded-md border border-green-200">
                    <p className="text-sm font-semibold text-green-900 mb-1">Chủ đề muốn học tiếp:</p>
                    <p className="text-sm text-green-800">{feedback.suggestedTopics}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
