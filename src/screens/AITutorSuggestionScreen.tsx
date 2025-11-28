import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';
import { mockTutors, Tutor } from '@/data/mockTutors';
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

export function AITutorSuggestionScreen({ onBack, filters }: AITutorSuggestionScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [suggestedTutors, setSuggestedTutors] = useState<Tutor[]>([]);

  useEffect(() => {
    // Simulate AI processing
    const timer = setTimeout(() => {
      // Calculate match scores for tutors
      const tutorsWithScores = mockTutors.map(tutor => {
        let matchScore = 50; // Base score

        // Department match
        if (filters.department && filters.department !== 'all' && tutor.department === filters.department) {
          matchScore += 15;
        }

        // Skills match
        if (filters.skills && filters.skills.length > 0) {
          const matchingSkills = filters.skills.filter(skill => tutor.skills.includes(skill)).length;
          matchScore += matchingSkills * 10;
        }

        // Rating match
        if (filters.minRating && filters.minRating !== 'all') {
          const minRatingValue = parseFloat(filters.minRating);
          if (tutor.rating >= minRatingValue) {
            matchScore += 10;
          }
        }

        // Meeting mode match
        if (filters.meetingMode && filters.meetingMode !== 'all') {
          if (tutor.meetingMode === filters.meetingMode || tutor.meetingMode === 'Both') {
            matchScore += 5;
          }
        }

        // Language match
        if (filters.language && filters.language !== 'all') {
          if (tutor.languages.includes(filters.language as any) || tutor.languages.includes('Both')) {
            matchScore += 5;
          }
        }

        // Rating boost
        matchScore += tutor.rating * 2;

        // Session count boost (experience)
        matchScore += Math.min(tutor.sessionCount / 10, 5);

        return { ...tutor, matchScore: Math.min(Math.round(matchScore), 100) };
      });

      // Sort by match score and take top 5
      const sorted = tutorsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      setSuggestedTutors(sorted.slice(0, 5));
      setIsLoading(false);
    }, 1500); // Simulate 1.5s AI processing

    return () => clearTimeout(timer);
  }, [filters]);

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
        {suggestedTutors.map((tutor) => (
          <TutorSuggestionCard key={tutor.id} tutor={tutor} />
        ))}
      </div>

      {suggestedTutors.length === 0 && (
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
  tutor: Tutor;
}

function TutorSuggestionCard({ tutor }: TutorSuggestionCardProps) {
  return (
    <Card className="relative">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
            {tutor.initials}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold">{tutor.name}</h3>
                <p className="text-sm text-muted-foreground">{tutor.specialization}</p>
              </div>
              {tutor.matchScore && (
                <Badge className="bg-green-500 text-white">
                  {tutor.matchScore}% Match
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm mb-2">
              <span className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                {tutor.rating} ({tutor.reviewCount})
              </span>
              <span>{tutor.sessionCount} sessions</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {tutor.skills.map((skill) => (
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
                {tutor.availability.slice(0, 3).map((slot, index) => (
                  <Badge key={index} variant="outline" className="bg-primary/10 border-primary/20">
                    {format(new Date(slot.date), 'MMM d')}, {slot.time}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                Book
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

