import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';
import type { TutorProfile } from '@/domain/entities/tutor';
import type { TutorSuggestion } from '@/domain/entities/tutorSuggestion';
import { SuggestionStatus } from '@/domain/enums';
import { tutorSuggestionService } from '@/application/services/tutorSuggestionService';
import { tutorService } from '@/application/services/tutorService';
import { useRole } from '@/contexts/RoleContext';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface AITutorSuggestionScreenProps {
  onBack: () => void;
  filters: {
    department?: string;
    skills?: string[];
    meetingMode?: string;
    gender?: string;
    minRating?: string;
    language?: string;
  };
}

interface SuggestionView {
  suggestion: TutorSuggestion;
  tutor?: TutorProfile;
}

export function AITutorSuggestionScreen({ onBack, filters }: AITutorSuggestionScreenProps) {
  const { userId } = useRole();
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<SuggestionView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    if (!userId) {
      setError('Vui lòng đăng nhập để nhận gợi ý.');
      setIsLoading(false);
      return;
    }

    const mappedMode =
      filters.meetingMode === 'online'
        ? 'Online'
        : filters.meetingMode === 'in-person'
        ? 'In-Person'
        : undefined;

    tutorSuggestionService
      .generateTutorSuggestions(userId, {
        department: filters.department && filters.department !== 'all' ? filters.department : undefined,
        preferredSkills: filters.skills && filters.skills.length > 0 ? filters.skills : undefined,
        meetingMode: mappedMode,
      })
      .then(async (results) => {
        if (cancelled) return;
        const enriched = await Promise.all(
          results.slice(0, 5).map(async (suggestion) => {
            const tutor = await tutorService.getById(suggestion.tutorId);
            return { suggestion, tutor };
          }),
        );
        if (!cancelled) {
          setSuggestions(enriched);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setError('Không thể tạo gợi ý AI lúc này.');
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, userId]);

  const handleAccept = async (suggestionId: string) => {
    await tutorSuggestionService.acceptSuggestion(suggestionId);
    setSuggestions((prev) =>
      prev.map((entry) =>
        entry.suggestion.suggestionId === suggestionId
          ? { ...entry, suggestion: { ...entry.suggestion, status: SuggestionStatus.ACCEPTED } }
          : entry,
      ),
    );
    toast({ title: 'Gợi ý đã được chấp nhận' });
  };

  const handleReject = async (suggestionId: string) => {
    await tutorSuggestionService.rejectSuggestion(suggestionId);
    setSuggestions((prev) =>
      prev.map((entry) =>
        entry.suggestion.suggestionId === suggestionId
          ? { ...entry, suggestion: { ...entry.suggestion, status: SuggestionStatus.REJECTED } }
          : entry,
      ),
    );
    toast({ title: 'Gợi ý đã được từ chối' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-pulse">
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
        <p className="text-muted-foreground">AI is analyzing your preferences...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        {error}
        <div className="mt-4">
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">AI Tutor Suggestion</h1>
            <p className="text-muted-foreground">
              Based on your profile, learning goals, and availability.
            </p>
          </div>
        </div>
      </div>

      {/* Top Matches Badge */}
      <div className="flex items-center gap-2">
        <Badge className="bg-primary text-primary-foreground">Top 5 matches</Badge>
      </div>

      {/* Suggested Tutors */}
      <div className="space-y-4">
        {suggestions.map(({ tutor, suggestion }) => (
          <TutorSuggestionCard
            key={suggestion.suggestionId}
            tutor={tutor}
            suggestion={suggestion}
            onAccept={() => handleAccept(suggestion.suggestionId)}
            onReject={() => handleReject(suggestion.suggestionId)}
          />
        ))}
      </div>

      {suggestions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No suitable tutors found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface TutorSuggestionCardProps {
  tutor?: TutorProfile;
  suggestion: TutorSuggestion;
  onAccept: () => void;
  onReject: () => void;
}

function TutorSuggestionCard({ tutor, suggestion, onAccept, onReject }: TutorSuggestionCardProps) {
  return (
    <Card className="relative">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
            {tutor?.initials ?? 'TS'}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold">{tutor?.name ?? suggestion.tutorId}</h3>
                <p className="text-sm text-muted-foreground">{tutor?.specialization}</p>
              </div>
              <Badge className="bg-green-500 text-white">{suggestion.score}% Match</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm mb-2">
              {tutor && (
                <>
                  <span className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    {tutor.rating} ({tutor.reviewCount})
                  </span>
                  <span>{tutor.sessionCount} sessions</span>
                </>
              )}
              <Badge variant="outline">{suggestion.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {tutor?.skills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Next Available</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tutor?.availability.slice(0, 3).map((slot, index) => (
                  <Badge key={index} variant="outline" className="bg-primary/10 border-primary/20">
                    {format(new Date(slot.date), 'MMM d')}, {slot.time}
                  </Badge>
                )) ?? <span className="text-xs text-muted-foreground">No schedule data</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={onAccept} disabled={suggestion.status !== SuggestionStatus.PENDING}>
                Accept
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={onReject}>
                Reject
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

