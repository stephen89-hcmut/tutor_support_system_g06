import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CancelMeetingModal } from '@/components/CancelMeetingModal';
import { RescheduleModal } from '@/components/RescheduleModal';
import { FeedbackModal } from '@/components/FeedbackModal';
import { MeetingDetailModal } from "@/components/MeetingDetailModal";
import { PaginationEnhanced } from '@/components/ui/pagination-enhanced';
import type { Meeting, MeetingStatus } from '@/domain/entities/meeting';
import { meetingService } from '@/application/services/meetingService';
import { meetingFeedbackService } from '@/application/services/meetingFeedbackService';
import {
  Calendar,
  Video,
  MapPin,
  MoreVertical,
  X,
  MessageSquare,
  LogIn,
} from "lucide-react";
import { useRole } from '@/contexts/RoleContext';

interface MeetingsScreenProps {
  onCancel: (meetingId: string, cancelledBy: string, reason: string) => void;
  onBookNewMeeting: () => void;
}

export function MeetingsScreen({
  onCancel,
  onBookNewMeeting,
}: MeetingsScreenProps) {
  const { role, userId } = useRole();
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rescheduleMeeting, setRescheduleMeeting] = useState<Meeting | null>(
    null
  );
  const [feedbackMeeting, setFeedbackMeeting] = useState<Meeting | null>(null);
  const [activeTab, setActiveTab] = useState<MeetingStatus>("Scheduled");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<Record<MeetingStatus, number>>(
    {
      Scheduled: 1,
      "In Progress": 1,
      Completed: 1,
      Cancelled: 1,
    }
  );
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    let mounted = true;
    const loadMeetings = async () => {
      setLoading(true);
      setError(null);
      try {
        let data: Meeting[] = [];

        // Nếu là student thì chỉ load meetings theo studentId
        if (role === "Student" && userId) {
          data = await meetingService.getByStudent(userId);
        } else if (role === "Tutor" && userId) {
          // Nếu là tutor thì chỉ load meetings theo tutorId
          data = await meetingService.getByTutor(userId);
        } else {
          // Manager có thể xem toàn bộ
          data = await meetingService.getAll();
        }

        if (!mounted) return;
        setMeetings(data);
      } catch (err) {
        if (!mounted) return;
        setError("Không thể tải danh sách buổi học.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadMeetings();
    return () => {
      mounted = false;
    };
  }, [role, userId]);

  const meetingsByStatus = useMemo<Record<MeetingStatus, Meeting[]>>(() => {
    return {
      Scheduled: meetings.filter((m) => m.status === "Scheduled"),
      "In Progress": meetings.filter((m) => m.status === "In Progress"),
      Completed: meetings.filter((m) => m.status === "Completed"),
      Cancelled: meetings.filter((m) => m.status === "Cancelled"),
    };
  }, [meetings]);

  // Get all unique subjects/topics for filter dropdown
  const uniqueSubjects = useMemo(() => {
    const subjects = new Set(meetings.map((m) => m.topic));
    return Array.from(subjects).sort();
  }, [meetings]);

  // Filter meetings based on search and subject
  const getFilteredMeetings = (status: MeetingStatus): Meeting[] => {
    let filtered = meetingsByStatus[status];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.studentName.toLowerCase().includes(query) ||
          m.tutorName.toLowerCase().includes(query)
      );
    }

    if (selectedSubject !== "all") {
      filtered = filtered.filter((m) => m.topic === selectedSubject);
    }

    return filtered;
  };

  const handleRatingSubmit = (
    meetingId: string,
    studentRating: {
      knowledge: number;
      communication: number;
      helpfulness: number;
      punctuality: number;
      comment?: string;
      submittedAt?: string;
    }
  ) => {
    // Update the meeting with the rating
    setMeetings((prev) =>
      prev.map((meeting) =>
        meeting.id === meetingId ? { ...meeting, studentRating } : meeting
      )
    );

    // Here you would also send a notification to the tutor
    // For now, we'll log it
    console.log(`Rating submitted for meeting ${meetingId}:`, studentRating);

    // You can add notification logic here
    // Example: Send notification to tutor about the feedback received
  };

  const handleRescheduleClick = (meeting: Meeting) => {
    // Validate role permission (UCB1.2) - only the relevant Student/Tutor can reschedule
    if (role === "Student" && userId && meeting.studentId !== userId) {
      alert("Bạn không có quyền thay đổi buổi học này.");
      return;
    }
    if (role === "Tutor" && userId && meeting.tutorId !== userId) {
      alert("Bạn không có quyền thay đổi buổi học này.");
      return;
    }
    setRescheduleMeeting(meeting);
  };

  const handleCancelClick = (meeting: Meeting) => {
    // Validate role permission (UCB1.2) - only the relevant Student/Tutor can cancel
    if (role === "Student" && userId && meeting.studentId !== userId) {
      alert("Bạn không có quyền hủy buổi học này.");
      return;
    }
    if (role === "Tutor" && userId && meeting.tutorId !== userId) {
      alert("Bạn không có quyền hủy buổi học này.");
      return;
    }
    setSelectedMeeting(meeting);
    setShowCancelModal(true);
  };

  const handleRescheduleComplete = async (
    meetingId: string,
    newDate: string,
    newTime: string
  ) => {
    await meetingService.update(meetingId, { date: newDate, time: newTime });
    setMeetings((prev) =>
      prev.map((meeting) =>
        meeting.id === meetingId
          ? { ...meeting, date: newDate, time: newTime }
          : meeting
      )
    );
    setRescheduleMeeting(null);
  };

  const handleFeedbackClick = (meeting: Meeting) => {
    // Only students can submit feedback
    if (role !== "Student") {
      alert("Chỉ sinh viên có thể gửi đánh giá.");
      return;
    }
    // Only the student of the meeting can feedback
    if (userId && meeting.studentId !== userId) {
      alert("Bạn không có quyền đánh giá buổi học này.");
      return;
    }
    setFeedbackMeeting(meeting);
  };

  const handleFeedbackSubmit = async (
    meetingId: string,
    rating: number,
    comment: string,
    suggestedTopics?: string
  ) => {
    await meetingFeedbackService.submitFeedback({
      meetingId,
      studentId: userId || "",
      tutorId: feedbackMeeting?.tutorId || "",
      rating,
      comment,
      suggestedTopics,
    });
  };

  const handleCancelComplete = (
    meetingId: string,
    cancelledBy: string,
    reason: string
  ) => {
    onCancel(meetingId, cancelledBy, reason);
    setMeetings((prev) =>
      prev.map((meeting) =>
        meeting.id === meetingId
          ? {
              ...meeting,
              status: "Cancelled",
              cancelledBy: cancelledBy as Meeting["cancelledBy"],
              cancellationReason: reason,
            }
          : meeting
      )
    );
    setShowCancelModal(false);
    setSelectedMeeting(null);
  };

  const handleJoinMeeting = (meeting: Meeting) => {
    // Xác minh quyền cơ bản: chỉ student/tutor liên quan mới join
    if (role === "Student" && userId && meeting.studentId !== userId) {
      alert("Bạn không có quyền tham gia buổi học này.");
      return;
    }
    if (role === "Tutor" && userId && meeting.tutorId !== userId) {
      alert("Bạn không có quyền tham gia buổi học này.");
      return;
    }

    // Mở link hoặc hiển thị địa điểm
    if (meeting.mode !== "In-Person" && meeting.link) {
      window.open(meeting.link, "_blank");
    } else if (meeting.mode === "In-Person" && meeting.location) {
      alert(`Địa điểm: ${meeting.location}`);
    } else {
      alert("Không thể tham gia. Liên kết hoặc địa điểm không hợp lệ.");
      return;
    }

    // Đánh dấu In Progress trong state (mock)
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meeting.id
          ? {
              ...m,
              status: "In Progress",
              actualStartTime: new Date().toISOString(),
            }
          : m
      )
    );
  };

  const getModeIcon = (mode: string) => {
    if (mode === "Zoom" || mode === "Teams") {
      return <Video className="h-4 w-4" />;
    }
    return <MapPin className="h-4 w-4" />;
  };
  const getModeDisplay = (meeting: Meeting) => {
    if (meeting.mode === "In-Person") {
      return meeting.location || "In-Person";
    }
    return `${meeting.mode} Link`;
  };

  // Helper function to check if join button should be visible and its color
  // Join button is enabled (green) only when time left <= 30 minutes
  const getJoinButtonStatus = (
    meeting: Meeting
  ): { canShow: boolean; isEnabled: boolean } => {
    if (meeting.status !== "Scheduled")
      return { canShow: false, isEnabled: false };

    const now = new Date();
    const meetingDateTime = new Date(`${meeting.date} ${meeting.time}`);
    const timeLeftMs = meetingDateTime.getTime() - now.getTime();
    const timeLeftMinutes = timeLeftMs / (1000 * 60);

    // Always show join button for upcoming meetings
    const canShow = timeLeftMinutes > 0;
    // Button is enabled (green) only when within 30 minutes
    const isEnabled = canShow && timeLeftMinutes <= 30;

    return { canShow, isEnabled };
  };

  // If rescheduling, show reschedule modal
  const showRescheduleModal = !!rescheduleMeeting;

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Đang tải danh sách buổi học...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-muted-foreground">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meetings</h1>
          <p className="text-muted-foreground">
            Manage your scheduled meetings
          </p>
        </div>
        {role === "Student" && (
          <Button
            className="bg-primary hover:bg-primary-dark"
            onClick={onBookNewMeeting}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Book New Meeting
          </Button>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value: string) => setActiveTab(value as MeetingStatus)}
      >
        <TabsList>
          <TabsTrigger value="Scheduled">
            Upcoming ({meetingsByStatus.Scheduled.length})
          </TabsTrigger>
          <TabsTrigger value="Completed">
            Completed ({meetingsByStatus.Completed.length})
          </TabsTrigger>
          <TabsTrigger value="Cancelled">
            Cancelled ({meetingsByStatus.Cancelled.length})
          </TabsTrigger>
        </TabsList>

        {(["Scheduled", "Completed", "Cancelled"] as MeetingStatus[]).map(
          (status) => {
            const filteredMeetings = getFilteredMeetings(status);
            const totalPages = Math.ceil(
              filteredMeetings.length / itemsPerPage
            );
            const page = currentPage[status];
            const startIdx = (page - 1) * itemsPerPage;
            const paginatedMeetings = filteredMeetings.slice(
              startIdx,
              startIdx + itemsPerPage
            );

            return (
              <TabsContent key={status} value={status}>
                <Card>
                  <CardHeader>
                    <CardTitle>{status} Meetings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Search and Filter Section */}
                    <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Search by Student or Tutor Name
                        </label>
                        <div className="relative">
                          <Input
                            placeholder="Search by student or tutor name..."
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              setCurrentPage((prev) => ({
                                ...prev,
                                [status]: 1,
                              }));
                            }}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="w-full md:w-48">
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Filter by Subject
                        </label>
                        <select
                          value={selectedSubject}
                          onChange={(e) => {
                            setSelectedSubject(e.target.value);
                            setCurrentPage((prev) => ({
                              ...prev,
                              [status]: 1,
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">All Subjects</option>
                          {uniqueSubjects.map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                        </select>
                      </div>

                      {(searchQuery || selectedSubject !== "all") && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedSubject("all");
                            setCurrentPage((prev) => ({
                              ...prev,
                              [status]: 1,
                            }));
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>

                    {filteredMeetings.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        {searchQuery || selectedSubject !== "all"
                          ? "No meetings match your filters"
                          : `No ${status.toLowerCase()} meetings`}
                      </p>
                    ) : (
                      <>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date & Time</TableHead>
                              <TableHead>Student</TableHead>
                              <TableHead>Tutor</TableHead>
                              <TableHead>Topic</TableHead>
                              <TableHead>Mode</TableHead>
                              <TableHead>Status</TableHead>
                              {status === "Scheduled" && (
                                <TableHead className="text-right">
                                  Actions
                                </TableHead>
                              )}
                              {status === "Completed" && role === "Student" && (
                                <TableHead className="text-right">
                                  Actions
                                </TableHead>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedMeetings.map((meeting) => {
                              const {
                                canShow: showJoinBtn,
                                isEnabled: joinBtnEnabled,
                              } = getJoinButtonStatus(meeting);
                              return (
                                <TableRow
                                  key={meeting.id}
                                  className="cursor-pointer hover:bg-muted/50"
                                  onClick={() => {
                                    setSelectedMeeting(meeting);
                                    setShowDetailModal(true);
                                  }}
                                >
                                  <TableCell>
                                    {meeting.date} at {meeting.time}
                                  </TableCell>
                                  <TableCell>{meeting.studentName}</TableCell>
                                  <TableCell>{meeting.tutorName}</TableCell>
                                  <TableCell>{meeting.topic}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {getModeIcon(meeting.mode)}
                                      <span>{getModeDisplay(meeting)}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        meeting.status === "Scheduled"
                                          ? "default"
                                          : meeting.status === "Completed"
                                          ? "success"
                                          : "destructive"
                                      }
                                    >
                                      {meeting.status === "Scheduled"
                                        ? "Upcoming"
                                        : meeting.status}
                                    </Badge>
                                  </TableCell>
                                  {status === "Scheduled" && (
                                    <TableCell
                                      className="text-right"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="flex items-center justify-end gap-2">
                                        {showJoinBtn && (
                                          <Button
                                            variant={
                                              joinBtnEnabled
                                                ? "default"
                                                : "outline"
                                            }
                                            size="sm"
                                            onClick={() =>
                                              handleJoinMeeting(meeting)
                                            }
                                            disabled={!joinBtnEnabled}
                                            className={
                                              joinBtnEnabled
                                                ? "bg-green-600 hover:bg-green-700 text-white"
                                                : ""
                                            }
                                          >
                                            <LogIn className="mr-2 h-4 w-4" />
                                            Join
                                          </Button>
                                        )}
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleRescheduleClick(meeting)
                                          }
                                        >
                                          <Calendar className="mr-2 h-4 w-4" />
                                          Reschedule
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() =>
                                            handleCancelClick(meeting)
                                          }
                                        >
                                          <X className="mr-2 h-4 w-4" />
                                          Cancel
                                        </Button>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                              <MoreVertical className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleRescheduleClick(meeting)
                                              }
                                            >
                                              Reschedule
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleCancelClick(meeting)
                                              }
                                            >
                                              Cancel
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </TableCell>
                                  )}
                                  {status === "Completed" &&
                                    role === "Student" && (
                                      <TableCell
                                        className="text-right"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleFeedbackClick(meeting)
                                          }
                                        >
                                          <MessageSquare className="mr-2 h-4 w-4" />
                                          Feedback
                                        </Button>
                                      </TableCell>
                                    )}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-center mt-6 pt-4">
                            <PaginationEnhanced
                              currentPage={page}
                              totalPages={totalPages}
                              itemsPerPage={itemsPerPage}
                              onPageChange={(newPage) =>
                                setCurrentPage((prev) => ({
                                  ...prev,
                                  [status]: newPage,
                                }))
                              }
                              onItemsPerPageChange={setItemsPerPage}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          }
        )}
      </Tabs>

      <CancelMeetingModal
        meeting={selectedMeeting}
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        onCancel={handleCancelComplete}
      />

      <RescheduleModal
        meeting={rescheduleMeeting}
        isOpen={showRescheduleModal}
        onClose={() => setRescheduleMeeting(null)}
        onReschedule={handleRescheduleComplete}
      />

      <FeedbackModal
        meeting={feedbackMeeting}
        isOpen={!!feedbackMeeting}
        onClose={() => setFeedbackMeeting(null)}
        onSubmit={handleFeedbackSubmit}
      />

      <MeetingDetailModal
        meeting={selectedMeeting}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onJoinClick={handleJoinMeeting}
        role={role as "Student" | "Tutor" | "Manager" | undefined}
        onRatingSubmit={handleRatingSubmit}
      />
    </div>
  );
}

