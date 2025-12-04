import { useEffect, useMemo, useState } from 'react';
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
import { Search, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import type { TutorProfile } from '@/domain/entities/tutor';
import type { Course } from '@/domain/entities/course';
import { tutorService } from '@/application/services/tutorService';
import { studentService } from '@/application/services/studentService';
import { courseService } from '@/application/services/courseService';
import { AITutorSuggestionScreen } from './AITutorSuggestionScreen';
import { BookMeetingModal } from '@/components/BookMeetingModal';
import { getSubjectsForDepartment } from '@/data/departmentSubjects';
import { useRole } from '@/contexts/RoleContext';

interface FindTutorScreenProps {
  onViewTutorProfile?: (tutorId: string) => void;
  onBookingSuccess?: () => void;
}

export function FindTutorScreen({ onViewTutorProfile, onBookingSuccess }: FindTutorScreenProps) {
  const { role, userId } = useRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [meetingMode, setMeetingMode] = useState<string>('all');
  const [gender, setGender] = useState<string>('all');
  const [minRating, setMinRating] = useState<string>('all');
  const [language, setLanguage] = useState<string>('all');
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<TutorProfile | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentDepartment, setStudentDepartment] = useState<string | null>(null);
  const [departmentSubjects, setDepartmentSubjects] = useState<string[]>([]);
  const itemsPerPage = 9;

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [tutorData, courseData] = await Promise.all([
          tutorService.list(),
          courseService.getAll(),
        ]);
        if (!mounted) return;
        setTutors(tutorData);
        setCourses(courseData);
      } catch (err) {
        if (!mounted) return;
        setError('Không thể tải danh sách gia sư và khóa học.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Load student's department if role is Student
  useEffect(() => {
    if (role !== 'Student' || !userId) return;
    
    let mounted = true;
    const loadStudentDepartment = async () => {
      try {
        const student = await studentService.getByAccountUserId(userId);
        if (!mounted) return;
        if (student && student.personalInfo.department) {
          setStudentDepartment(student.personalInfo.department);
          const subjects = getSubjectsForDepartment(student.personalInfo.department);
          setDepartmentSubjects(subjects);
        }
      } catch (err) {
        console.error('Failed to load student department:', err);
      }
    };

    loadStudentDepartment();
    return () => {
      mounted = false;
    };
  }, [role, userId]);

  const allSkills = useMemo(() => {
    // For students, show only their department's subjects
    if (role === 'Student' && departmentSubjects.length > 0) {
      return departmentSubjects;
    }
    
    // For other roles, show all tutor skills
    const skillsSet = new Set<string>();
    tutors.forEach((tutor) => {
      tutor.skills.forEach(skill => skillsSet.add(skill));
    });
    return Array.from(skillsSet);
  }, [tutors, role, departmentSubjects]);

  const departments = useMemo(() => {
    const deptSet = new Set(tutors.map(t => t.department));
    return Array.from(deptSet);
  }, [tutors]);

  const filteredTutors = useMemo(() => {
    let tutorList = [...tutors];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tutorList = tutorList.filter(
        tutor =>
          tutor.name.toLowerCase().includes(query)
      );
    }

    // Filter by selected course
    if (selectedCourse) {
      const course = courses.find(c => c.courseId === selectedCourse);
      if (course && course.tutorIds) {
        tutorList = tutorList.filter(tutor => course.tutorIds?.includes(tutor.id));
      }
    }

    if (selectedSkills.length > 0) {
      tutorList = tutorList.filter(tutor =>
        selectedSkills.some(skill => tutor.skills.includes(skill))
      );
    }

    if (meetingMode !== 'all') {
      tutorList = tutorList.filter(tutor => {
        if (meetingMode === 'online') {
          return tutor.meetingMode === 'Online' || tutor.meetingMode === 'Both';
        } else if (meetingMode === 'in-person') {
          return tutor.meetingMode === 'In-Person' || tutor.meetingMode === 'Both';
        }
        return true;
      });
    }

    if (gender !== 'all') {
      tutorList = tutorList.filter(tutor => tutor.gender === gender);
    }

    if (minRating !== 'all') {
      const minRatingValue = parseFloat(minRating);
      tutorList = tutorList.filter(tutor => tutor.rating >= minRatingValue);
    }

    if (language !== 'all') {
      tutorList = tutorList.filter(tutor =>
        (tutor.languages as string[]).includes(language) || tutor.languages.includes('Both')
      );
    }

    return tutorList;
  }, [searchQuery, selectedCourse, selectedSkills, meetingMode, gender, minRating, language, tutors, courses]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleFindTutors = () => {
    setShowAISuggestion(false);
    setCurrentPage(1);
  };

  const handleAISuggestion = () => {
    setShowAISuggestion(true);
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Đang tải danh sách gia sư...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-muted-foreground">{error}</div>;
  }

  if (showAISuggestion) {
    return (
      <AITutorSuggestionScreen
        onBack={() => setShowAISuggestion(false)}
        filters={{
          skills: selectedSkills,
          meetingMode,
          gender,
          minRating,
          language,
        }}
      />
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredTutors.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedTutors = filteredTutors.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Find Your Perfect Tutor</h1>
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
                placeholder="Search tutors by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Subject/Course Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Select value={selectedCourse || 'all'} onValueChange={(value) => setSelectedCourse(value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {[...courses].sort((a, b) => a.courseName.localeCompare(b.courseName)).map((course) => (
                      <SelectItem key={course.courseId} value={course.courseId}>
                        {course.courseName} ({course.courseCode})
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
              <Button onClick={handleFindTutors} className="bg-primary hover:bg-primary-dark">
                Find Tutors
              </Button>
              <Button
                variant="outline"
                onClick={handleAISuggestion}
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedTutors.map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                onBook={() => {
                  setSelectedTutor(tutor);
                  setShowBookModal(true);
                }}
                onViewProfile={() => onViewTutorProfile?.(tutor.id)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    className="w-10 h-10 p-0"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>

              <span className="text-sm text-muted-foreground ml-4">
                Page {currentPage} of {totalPages} • Showing {paginatedTutors.length} of {filteredTutors.length}
              </span>
            </div>
          )}
        </>
      )}

      {/* Book Meeting Modal */}
      {selectedTutor && (
        <BookMeetingModal
          tutor={selectedTutor}
          open={showBookModal}
          onOpenChange={setShowBookModal}
          onBookComplete={() => {
            setShowBookModal(false);
            setSelectedTutor(null);
            onBookingSuccess?.();
          }}
        />
      )}
    </div>
  );
}

interface TutorCardProps {
  tutor: TutorProfile;
  onBook: () => void;
  onViewProfile: () => void;
}

function TutorCard({ tutor, onBook, onViewProfile }: TutorCardProps) {
  return (
    <Card>
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
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-4">{tutor.bio}</p>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={onBook}>
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

