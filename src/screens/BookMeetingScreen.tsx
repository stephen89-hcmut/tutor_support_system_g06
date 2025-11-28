import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Sparkles, Grid, List } from 'lucide-react';
import { mockTutors, Tutor } from '@/data/mockTutors';
import { BookMeetingModal } from '@/components/BookMeetingModal';
import { useRole } from '@/contexts/RoleContext';

interface BookMeetingScreenProps {
  onViewTutorProfile: (tutorId: string) => void;
}

export function BookMeetingScreen({ onViewTutorProfile }: BookMeetingScreenProps) {
  const { userId } = useRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [department, setDepartment] = useState<string>('all');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [meetingMode, setMeetingMode] = useState<string>('all');
  const [gender, setGender] = useState<string>('all');
  const [minRating, setMinRating] = useState<string>('all');
  const [language, setLanguage] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);

  const allSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    mockTutors.forEach(tutor => {
      tutor.skills.forEach(skill => skillsSet.add(skill));
    });
    return Array.from(skillsSet);
  }, []);

  const departments = useMemo(() => {
    const deptSet = new Set(mockTutors.map(t => t.department));
    return Array.from(deptSet);
  }, []);

  const filteredTutors = useMemo(() => {
    let tutors = [...mockTutors];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tutors = tutors.filter(
        tutor =>
          tutor.name.toLowerCase().includes(query) ||
          tutor.department.toLowerCase().includes(query) ||
          tutor.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Department filter
    if (department !== 'all') {
      tutors = tutors.filter(tutor => tutor.department === department);
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      tutors = tutors.filter(tutor =>
        selectedSkills.some(skill => tutor.skills.includes(skill))
      );
    }

    // Meeting mode filter
    if (meetingMode !== 'all') {
      tutors = tutors.filter(tutor => {
        if (meetingMode === 'online') {
          return tutor.meetingMode === 'Online' || tutor.meetingMode === 'Both';
        } else if (meetingMode === 'in-person') {
          return tutor.meetingMode === 'In-Person' || tutor.meetingMode === 'Both';
        }
        return true;
      });
    }

    // Gender filter
    if (gender !== 'all') {
      tutors = tutors.filter(tutor => tutor.gender === gender);
    }

    // Minimum rating filter
    if (minRating !== 'all') {
      const minRatingValue = parseFloat(minRating);
      tutors = tutors.filter(tutor => tutor.rating >= minRatingValue);
    }

    // Language filter
    if (language !== 'all') {
      tutors = tutors.filter(tutor =>
        tutor.languages.includes(language as any) || tutor.languages.includes('Both')
      );
    }

    return tutors;
  }, [searchQuery, department, selectedSkills, meetingMode, gender, minRating, language]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleBookClick = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setShowBookModal(true);
  };

  const handleBookComplete = () => {
    setShowBookModal(false);
    setSelectedTutor(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Book Your Meeting</h1>
        <p className="text-muted-foreground">
          Search and filter tutors based on your needs, or use AI to get personalized suggestions.
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tutors by name, department, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Department Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Gender Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Minimum Rating Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Rating</label>
                <Select value={minRating} onValueChange={setMinRating}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="4.5">4.5+ ★</SelectItem>
                    <SelectItem value="4.0">4.0+ ★</SelectItem>
                    <SelectItem value="3.5">3.5+ ★</SelectItem>
                    <SelectItem value="3.0">3.0+ ★</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Skills Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Skills</label>
              <div className="flex flex-wrap gap-2">
                {allSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Meeting Mode Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Meeting Mode</label>
              <div className="flex gap-2">
                <Button
                  variant={meetingMode === 'online' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMeetingMode(meetingMode === 'online' ? 'all' : 'online')}
                >
                  Online
                </Button>
                <Button
                  variant={meetingMode === 'in-person' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMeetingMode(meetingMode === 'in-person' ? 'all' : 'in-person')}
                >
                  In-Person
                </Button>
              </div>
            </div>

            {/* Language Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <div className="flex gap-2">
                <Button
                  variant={language === 'English' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage(language === 'English' ? 'all' : 'English')}
                >
                  English
                </Button>
                <Button
                  variant={language === 'Vietnamese' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage(language === 'Vietnamese' ? 'all' : 'Vietnamese')}
                >
                  Vietnamese
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button className="bg-primary hover:bg-primary-dark">
                Find Tutors
              </Button>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Use AI Suggestion
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredTutors.length} tutors found
        </p>
        <div className="flex items-center gap-2">
          <Select defaultValue="relevance">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Sort by Relevance</SelectItem>
              <SelectItem value="rating">Highest Rating</SelectItem>
              <SelectItem value="sessions">Most Sessions</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tutor List */}
      {filteredTutors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No tutors found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {filteredTutors.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              onBook={() => handleBookClick(tutor)}
              onViewProfile={() => onViewTutorProfile(tutor.id)}
            />
          ))}
        </div>
      )}

      {/* Book Meeting Modal */}
      {selectedTutor && (
        <BookMeetingModal
          tutor={selectedTutor}
          open={showBookModal}
          onOpenChange={setShowBookModal}
          onBookComplete={handleBookComplete}
        />
      )}
    </div>
  );
}

interface TutorCardProps {
  tutor: Tutor;
  onBook: () => void;
  onViewProfile: () => void;
}

function TutorCard({ tutor, onBook, onViewProfile }: TutorCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg flex-shrink-0">
            {tutor.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate">{tutor.name}</h3>
                <p className="text-sm text-muted-foreground">{tutor.specialization}</p>
              </div>
              {tutor.matchScore && (
                <Badge className="bg-green-500 text-white ml-2">
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
              {tutor.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{tutor.bio}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <span>{tutor.meetingMode}</span>
              <span>•</span>
              <span>{tutor.languages.join(', ')}</span>
            </div>
            {tutor.availability.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Upcoming Availability:</p>
                <div className="space-y-1">
                  {tutor.availability.slice(0, 3).map((slot, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground">
                      {new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {slot.time}
                    </p>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-primary hover:bg-primary-dark" onClick={onBook}>
                Book
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={onViewProfile}>
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

