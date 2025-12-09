import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PaginationEnhanced } from '@/components/ui/pagination-enhanced';
import { ArrowLeft, Eye, Star, X } from 'lucide-react';
import type { Meeting } from '@/domain/entities/meeting';
import type { UserProfile } from '@/domain/entities/profile';
import { meetingService } from '@/application/services/meetingService';
import { profileService } from '@/application/services/profileService';
import { useAsyncData } from '@/hooks/useAsyncData';

interface MeetingManagementPageProps {
  onBack: () => void;
}

export function MeetingManagementPage({ onBack }: MeetingManagementPageProps) {
  const { data, loading, error } = useAsyncData<Meeting[]>(() => meetingService.getAll(), []);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const stats = useMemo(() => {
    if (!data?.length) {
      return {
        total: 0,
        completed: 0,
        scheduled: 0,
        cancelled: 0,
      };
    }
    return {
      total: data.length,
      completed: data.filter(m => m.status === 'Completed').length,
      scheduled: data.filter(m => m.status === 'Scheduled').length,
      cancelled: data.filter(m => m.status === 'Cancelled').length,
    };
  }, [data]);

  const handleViewDetails = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowDetails(true);
  };

  // Load profile when selectedProfileId changes
  useEffect(() => {
    if (!selectedProfileId) {
      setSelectedProfile(null);
      return;
    }

    let mounted = true;
    setProfileLoading(true);

    const loadProfile = async () => {
      try {
        const profile = await profileService.getProfileByUserId(selectedProfileId);
        if (mounted) {
          setSelectedProfile(profile || null);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        if (mounted) {
          setSelectedProfile(null);
        }
      } finally {
        if (mounted) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [selectedProfileId]);

  const handleViewProfile = (userId: string) => {
    setSelectedProfileId(userId);
    setShowProfileModal(true);
  };

  // Get all unique subjects from meetings
  const subjects = useMemo(() => {
    if (!data?.length) return [];
    return ['All', ...new Set(data.map(m => m.topic || 'Unknown'))];
  }, [data]);

  // Filter meetings based on search and filters
  const filteredMeetings = useMemo(() => {
    if (!data?.length) return [];
    
    return data.filter(m => {
      // Search filter - by student name, tutor name
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        m.studentName.toLowerCase().includes(searchLower) ||
        m.tutorName.toLowerCase().includes(searchLower);
      
      // Status filter
      const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
      
      // Subject filter
      const matchesSubject = filterSubject === 'All' || m.topic === filterSubject;
      
      return matchesSearch && matchesStatus && matchesSubject;
    });
  }, [data, searchTerm, filterStatus, filterSubject]);

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading meetings...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-muted-foreground">Error loading meetings</div>;
  }

  const totalPages = Math.ceil((filteredMeetings?.length || 0) / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedMeetings = (filteredMeetings || []).slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Meetings</h1>
          </div>
          <p className="text-muted-foreground">View and manage all meetings with detailed tutor and student information</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <span className="text-lg">📊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <span className="text-lg">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <span className="text-lg">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduled}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <span className="text-lg">❌</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Input
              placeholder="Search by student name or tutor name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pr-8"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Row */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Status</label>
              <Select value={filterStatus} onValueChange={(value) => {
                setFilterStatus(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Subject</label>
              <Select value={filterSubject} onValueChange={(value) => {
                setFilterSubject(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results info */}
          <div className="text-sm text-gray-600">
            Found <strong>{filteredMeetings.length}</strong> meeting{filteredMeetings.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        </CardContent>
      </Card>

      {/* Meetings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeetings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No meetings found matching your search criteria
                  </TableCell>
                </TableRow>
              ) : null}
              {paginatedMeetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell>
                    <div className="font-medium">{meeting.date}</div>
                    <div className="text-sm text-muted-foreground">{meeting.time}</div>
                  </TableCell>
                  <TableCell>{meeting.studentName}</TableCell>
                  <TableCell>{meeting.tutorName}</TableCell>
                  <TableCell>{meeting.topic}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{meeting.mode}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        meeting.status === 'Completed'
                          ? 'success'
                          : meeting.status === 'Scheduled'
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {meeting.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(meeting)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-6 pt-4">
              <PaginationEnhanced
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meeting Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Meeting Details</DialogTitle>
            <DialogDescription>
              Complete information about this meeting including evaluations and ratings
            </DialogDescription>
          </DialogHeader>

          {selectedMeeting && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
                  <p className="font-semibold">
                    {selectedMeeting.date} at {selectedMeeting.time}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Topic</p>
                  <p className="font-semibold">{selectedMeeting.topic}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Mode</p>
                  <Badge>{selectedMeeting.mode}</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      selectedMeeting.status === 'Completed'
                        ? 'success'
                        : selectedMeeting.status === 'Scheduled'
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {selectedMeeting.status}
                  </Badge>
                </div>
              </div>

              {/* Participants */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Participants</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Student Information */}
                  <div className="p-4 bg-blue-50 rounded-lg space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Student</p>
                      <button
                        className="text-left font-semibold text-lg text-blue-700 hover:underline"
                        onClick={() => {
                          if (selectedMeeting) {
                            handleViewProfile(selectedMeeting.studentId);
                          }
                        }}
                      >
                        {selectedMeeting.studentName}
                      </button>
                    </div>
                  </div>

                  {/* Tutor Information */}
                  <div className="p-4 bg-green-50 rounded-lg space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tutor</p>
                      <button
                        className="text-left font-semibold text-lg text-green-700 hover:underline"
                        onClick={() => {
                          if (selectedMeeting) {
                            handleViewProfile(selectedMeeting.tutorId);
                          }
                        }}
                      >
                        {selectedMeeting.tutorName}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evaluations & Ratings */}
              {selectedMeeting.status === 'Completed' && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4">Evaluations & Ratings</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Tutor's Evaluation of Student */}
                    <div className="p-4 border rounded-lg space-y-3 bg-orange-50">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">Tutor's Evaluation</p>
                        <span className="text-sm text-muted-foreground">of Student</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Rating:</span>
                          <div className="flex items-center gap-1">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < 4 ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-semibold">4.0/5.0</span>
                          </div>
                        </div>
                        
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Participation:</span> Excellent</p>
                          <p><span className="font-medium">Understanding:</span> Good</p>
                          <p><span className="font-medium">Progress:</span> Excellent</p>
                          <p><span className="font-medium">Comment:</span> Student showed great improvement in this session.</p>
                        </div>
                      </div>
                    </div>

                    {/* Student's Rating of Tutor */}
                    <div className="p-4 border rounded-lg space-y-3 bg-purple-50">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">Student's Rating</p>
                        <span className="text-sm text-muted-foreground">of Tutor</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Rating:</span>
                          <div className="flex items-center gap-1">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < 5 ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-semibold">5.0/5.0</span>
                          </div>
                        </div>
                        
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Teaching Quality:</span> Excellent</p>
                          <p><span className="font-medium">Explanation:</span> Very Clear</p>
                          <p><span className="font-medium">Helpfulness:</span> Very Helpful</p>
                          <p><span className="font-medium">Comment:</span> Best tutor ever! Highly recommended.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Meeting Notes */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Meeting Notes</h3>
                <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                  {selectedMeeting.status === 'Completed'
                    ? 'Discussion covered algebra fundamentals, practiced problem-solving techniques, and reviewed homework assignments.'
                    : 'Meeting is ' + selectedMeeting.status.toLowerCase() + '.'}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Modal (Nested) */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              Profile information
            </DialogDescription>
          </DialogHeader>

          {profileLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading profile...
            </div>
          ) : selectedProfile ? (
            <div className="space-y-4 py-4">
              {/* Basic Information */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="font-semibold">{selectedProfile.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{selectedProfile.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm">{selectedProfile.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <Badge className="mt-1">{selectedProfile.role}</Badge>
                </div>
              </div>

              {/* Subjects/Expertise (if applicable) */}
              {selectedProfile.expertise && selectedProfile.expertise.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.expertise.map((subject: string) => (
                      <Badge key={subject} variant="outline">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio/Description */}
              {selectedProfile.about && (
                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-muted-foreground mb-2">About</p>
                  <p className="text-sm text-muted-foreground">{selectedProfile.about}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Profile not found
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => {
              setShowProfileModal(false);
              setSelectedProfileId(null);
              setSelectedProfile(null);
            }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
