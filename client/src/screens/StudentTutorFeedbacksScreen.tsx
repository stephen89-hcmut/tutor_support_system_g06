import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { meetingFeedbackService } from '@/application/services/meetingFeedbackService';

interface TutorFeedback {
  id: string;
  meetingId: string;
  studentId: string;
  rating: number;
  comment: string;
  suggestedTopics?: string;
  createdAt: string;
}

interface StudentTutorFeedbacksPageProps {
  onBack: () => void;
}

export function StudentTutorFeedbacksPage({ onBack }: StudentTutorFeedbacksPageProps) {
  const { userId } = useRole();
  const [feedbacks, setFeedbacks] = useState<TutorFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const loadFeedbacks = async () => {
      if (!userId) return;
      try {
        const tutorFeedbacks = await meetingFeedbackService.getFeedbackByTutor(userId);
        setFeedbacks(tutorFeedbacks as unknown as TutorFeedback[]);
        
        if (tutorFeedbacks.length > 0) {
          const avg = tutorFeedbacks.reduce((sum, f) => sum + f.rating, 0) / tutorFeedbacks.length;
          setAverageRating(Math.round(avg * 10) / 10);
        }
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
          <h1 className="text-3xl font-bold">Đánh giá từ sinh viên</h1>
          <p className="text-muted-foreground">Xem các đánh giá và phản hồi từ sinh viên của bạn</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Đánh giá trung bình</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-3xl font-bold">{averageRating}</p>
                <p className="text-sm text-muted-foreground">trên 5 sao</p>
              </div>
              {renderStars(Math.round(averageRating))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tổng số đánh giá</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{feedbacks.length}</p>
            <p className="text-sm text-muted-foreground">từ sinh viên</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân bố sao</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = feedbacks.filter((f) => f.rating === star).length;
              const percentage = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-6">{star}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Feedbacks List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Danh sách đánh giá</h2>
        {feedbacks.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Chưa có đánh giá nào từ sinh viên.
            </CardContent>
          </Card>
        ) : (
          feedbacks.map((feedback) => (
            <Card key={feedback.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {renderStars(feedback.rating)}
                    <span className="font-semibold">{feedback.rating}/5 sao</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(feedback.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <p className="text-gray-700 leading-relaxed">{feedback.comment}</p>

                {feedback.suggestedTopics && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Chủ đề muốn học tiếp:</p>
                    <p className="text-sm text-blue-800">{feedback.suggestedTopics}</p>
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
