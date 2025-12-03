import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Meeting, StudentRating } from "@/domain/entities/meeting";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Copy,
  CheckCircle,
  AlertCircle,
  User,
  Briefcase,
} from "lucide-react";
import { useState, useEffect } from "react";

interface MeetingDetailModalProps {
  meeting: Meeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoinClick?: (meeting: Meeting) => void;
  role?: "Student" | "Tutor" | "Manager";
  onRatingSubmit?: (meetingId: string, rating: StudentRating) => void;
}

export function MeetingDetailModal({
  meeting,
  open,
  onOpenChange,
  onJoinClick,
  role,
  onRatingSubmit,
}: MeetingDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [ratings, setRatings] = useState({
    knowledge: 0,
    communication: 0,
    helpfulness: 0,
    punctuality: 0,
  });
  const [comment, setComment] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

  // Check if rating was already submitted
  useEffect(() => {
    if (meeting?.studentRating) {
      setIsRatingSubmitted(true);
      setRatings({
        knowledge: meeting.studentRating.knowledge || 0,
        communication: meeting.studentRating.communication || 0,
        helpfulness: meeting.studentRating.helpfulness || 0,
        punctuality: meeting.studentRating.punctuality || 0,
      });
      setComment(meeting.studentRating.comment || "");
    } else {
      setIsRatingSubmitted(false);
      setRatings({
        knowledge: 0,
        communication: 0,
        helpfulness: 0,
        punctuality: 0,
      });
      setComment("");
    }
  }, [meeting]);

  if (!meeting) return null;

  const handleCopyLink = () => {
    if (meeting.link) {
      navigator.clipboard.writeText(meeting.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isScheduled = meeting.status === "Scheduled";
  const isCompleted = meeting.status === "Completed";
  const isCancelled = meeting.status === "Cancelled";

  // Calculate time remaining for join button state
  const getJoinButtonState = () => {
    if (!isScheduled) return { enabled: false, label: "Join Meeting" };

    const now = new Date();
    const meetingDateTime = new Date(`${meeting.date} ${meeting.time}`);
    const timeLeftMs = meetingDateTime.getTime() - now.getTime();
    const timeLeftMinutes = timeLeftMs / (1000 * 60);

    // Enabled only when within 30 minutes
    const enabled = timeLeftMinutes <= 30 && timeLeftMinutes > 0;

    return { enabled, label: "Join Meeting" };
  };

  const joinButtonState = getJoinButtonState();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-gray-50">
        {/* Header */}
        <div className="bg-white p-6 border-b">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Meeting Details
              </h2>
              <p className="text-gray-600 mt-1">{meeting.topic}</p>
            </div>
            <Badge
              variant={
                meeting.status === "Scheduled"
                  ? "default"
                  : meeting.status === "Completed"
                  ? "success"
                  : "destructive"
              }
              className="text-sm px-3 py-1"
            >
              {meeting.status === "Scheduled" ? "Upcoming" : meeting.status}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Meeting Information */}
            <div className="col-span-2 space-y-6">
              {/* Meeting Information Section */}
              <div className="bg-white rounded-lg p-6 space-y-6">
                <h3 className="font-semibold text-lg text-gray-900">
                  Meeting Information
                </h3>

                <div className="space-y-4">
                  {/* Date & Time */}
                  <div className="flex items-start gap-4">
                    <Calendar className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Date</p>
                      <p className="text-gray-900 font-semibold">
                        {meeting.date}
                      </p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Time</p>
                      <p className="text-gray-900 font-semibold">
                        {meeting.time} (60 minutes)
                      </p>
                    </div>
                  </div>

                  {/* Location/Link */}
                  {meeting.mode === "In-Person" && meeting.location && (
                    <div className="flex items-start gap-4">
                      <MapPin className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500 font-medium">
                          Location
                        </p>
                        <p className="text-blue-600 font-semibold">
                          {meeting.link || meeting.location}
                        </p>
                      </div>
                    </div>
                  )}

                  {meeting.mode !== "In-Person" && meeting.link && (
                    <div className="flex items-start gap-4">
                      <Video className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500 font-medium">
                          Location
                        </p>
                        <p className="text-blue-600 font-semibold underline cursor-pointer hover:no-underline">
                          {meeting.link}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description Section */}
              {meeting.notes && (
                <div className="bg-white rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {meeting.notes}
                  </p>
                </div>
              )}

              {/* Learning Objectives Section */}
              <div className="bg-white rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">
                  Learning Objectives
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-3 text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Master integration by parts technique</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Apply trigonometric substitution</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Understand partial fraction decomposition</span>
                  </li>
                </ul>
              </div>

              {/* Progress Record Section - Only for Completed */}
              {isCompleted && (
                <div className="bg-white rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold text-lg text-gray-900">
                      Progress Record
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Attendance Status
                      </p>
                      <Badge className="mt-2 bg-green-500">Present</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Actual Duration
                      </p>
                      <p className="text-gray-900 font-semibold mt-2">
                        63 minutes
                      </p>
                      <p className="text-xs text-gray-500">
                        09:02 AM - 10:05 AM
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 py-4 border-t">
                    <h4 className="font-medium text-gray-900">
                      Topics Covered
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      <li>Review of basic differential equations</li>
                      <li>First-order linear differential equations</li>
                      <li>Separation of variables technique</li>
                      <li>Applications in electrical circuits</li>
                      <li>Practice problems and solutions</li>
                    </ul>
                  </div>

                  {/* Homework */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      📝 Homework
                    </h4>
                    <p className="text-sm text-gray-700">
                      Complete exercises 5.1 to 5.5 from textbook, focus on
                      problems involving real-world applications.
                    </p>
                  </div>

                  {/* Student Performance */}
                  <div className="space-y-3 py-4 border-t">
                    <h4 className="font-medium text-gray-900">
                      Student Performance
                    </h4>
                    <p className="text-sm text-gray-600">
                      Excellent understanding of concepts. Student actively
                      participated, asked relevant questions, and demonstrated
                      strong problem-solving skills. Shows significant
                      improvement from previous sessions.
                    </p>
                  </div>

                  {/* Tutor Notes */}
                  <div className="space-y-3 py-4 border-t">
                    <h4 className="font-medium text-gray-900">Tutor Notes</h4>
                    <p className="text-sm text-gray-600">
                      Student grasped the concepts quickly. Recommend moving to
                      more advanced topics in the next session. May need
                      additional practice with complex boundary conditions.
                    </p>
                    <p className="text-xs text-gray-500 pt-2">
                      Recorded by Dr. Tran Minh Khoa • Oct 28, 2025 10:30 AM
                    </p>
                  </div>
                </div>
              )}

              {/* Cancellation Reason Section - Only for Cancelled */}
              {isCancelled && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <h3 className="font-semibold text-lg text-red-900">
                      Cancellation Reason
                    </h3>
                  </div>
                  <p className="text-gray-700">
                    {meeting.cancellationReason ||
                      "Student requested cancellation due to schedule conflict with another important exam. Meeting will be rescheduled for next week."}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-red-200">
                    <span>
                      Cancelled by: <strong>{meeting.cancelledBy}</strong>{" "}
                      (Student)
                    </span>
                    <span>Nov 8, 2025 05:30 PM</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Participants */}
            <div className="col-span-1 space-y-4">
              {/* Student Card */}
              <div className="bg-white rounded-lg p-6 space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900">Student</h3>
                </div>

                <div className="space-y-3">
                  <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center text-xl font-semibold">
                    NG
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {meeting.studentName}
                    </p>
                    <p className="text-xs text-gray-500">{meeting.studentId}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      nguyen.vana@hcmut.edu.vn
                    </p>
                  </div>
                </div>
              </div>

              {/* Tutor Card */}
              <div className="bg-white rounded-lg p-6 space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5 text-purple-500" />
                  <h3 className="font-semibold text-gray-900">Tutor</h3>
                </div>

                <div className="space-y-3">
                  <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center text-xl font-semibold">
                    TMK
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {meeting.tutorName}
                    </p>
                    <p className="text-xs text-gray-600 font-medium">
                      Computer Science
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      tmk@hcmut.edu.vn
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats - Only for Completed */}
              {isCompleted && (
                <div className="bg-white rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900">Quick Stats</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Duration
                      </p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        63 minutes
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Attendance
                      </p>
                      <Badge className="mt-2 bg-blue-500">Present</Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Student Rating Section - Only for Completed when role is Student */}
          {isCompleted && role === "Student" && (
            <div className="mt-6 bg-white rounded-lg p-6 space-y-4 border">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⭐</span>
                <h3 className="font-semibold text-lg text-gray-900">
                  Student Rating
                </h3>
              </div>

              <p className="text-gray-600 text-sm mb-6">
                Please rate this session to help us improve teaching quality.
              </p>

              {/* Knowledge Rating */}
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">Knowledge</p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={`knowledge-${star}`}
                        onClick={() =>
                          !isRatingSubmitted &&
                          setRatings((prev) => ({ ...prev, knowledge: star }))
                        }
                        disabled={isRatingSubmitted}
                        className={`focus:outline-none transition-colors ${
                          isRatingSubmitted
                            ? "cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        title={`Rate ${star} stars`}
                      >
                        <svg
                          className={`w-6 h-6 ${
                            star <= ratings.knowledge
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 fill-gray-300"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <span className="text-gray-500 ml-2">-</span>
                </div>
              </div>

              {/* Communication Rating */}
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">Communication</p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={`communication-${star}`}
                        onClick={() =>
                          !isRatingSubmitted &&
                          setRatings((prev) => ({
                            ...prev,
                            communication: star,
                          }))
                        }
                        disabled={isRatingSubmitted}
                        className={`focus:outline-none transition-colors ${
                          isRatingSubmitted
                            ? "cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        title={`Rate ${star} stars`}
                      >
                        <svg
                          className={`w-6 h-6 ${
                            star <= ratings.communication
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 fill-gray-300"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <span className="text-gray-500 ml-2">-</span>
                </div>
              </div>

              {/* Helpfulness Rating */}
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">Helpfulness</p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={`helpfulness-${star}`}
                        onClick={() =>
                          !isRatingSubmitted &&
                          setRatings((prev) => ({ ...prev, helpfulness: star }))
                        }
                        disabled={isRatingSubmitted}
                        className={`focus:outline-none transition-colors ${
                          isRatingSubmitted
                            ? "cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        title={`Rate ${star} stars`}
                      >
                        <svg
                          className={`w-6 h-6 ${
                            star <= ratings.helpfulness
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 fill-gray-300"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <span className="text-gray-500 ml-2">-</span>
                </div>
              </div>

              {/* Punctuality Rating */}
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">Punctuality</p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={`punctuality-${star}`}
                        onClick={() =>
                          !isRatingSubmitted &&
                          setRatings((prev) => ({ ...prev, punctuality: star }))
                        }
                        disabled={isRatingSubmitted}
                        className={`focus:outline-none transition-colors ${
                          isRatingSubmitted
                            ? "cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        title={`Rate ${star} stars`}
                      >
                        <svg
                          className={`w-6 h-6 ${
                            star <= ratings.punctuality
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 fill-gray-300"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <span className="text-gray-500 ml-2">-</span>
                </div>
              </div>

              {/* Comment Section */}
              <div className="space-y-2 pt-4">
                <label className="font-semibold text-gray-900">
                  Comment (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) =>
                    !isRatingSubmitted && setComment(e.target.value)
                  }
                  disabled={isRatingSubmitted}
                  placeholder="Share your experience with this session..."
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-h-24 ${
                    isRatingSubmitted
                      ? "bg-gray-50 text-gray-600 cursor-not-allowed"
                      : "bg-white"
                  }`}
                />
              </div>

              {/* Submit Button */}
              {!isRatingSubmitted ? (
                <Button
                  onClick={() => {
                    // Handle submit
                    const studentRating: StudentRating = {
                      knowledge: ratings.knowledge,
                      communication: ratings.communication,
                      helpfulness: ratings.helpfulness,
                      punctuality: ratings.punctuality,
                      comment: comment || undefined,
                      submittedAt: new Date().toISOString(),
                    };

                    if (onRatingSubmit) {
                      onRatingSubmit(meeting.id, studentRating);
                    }

                    setSubmitSuccess(true);
                    setIsRatingSubmitted(true);

                    // Show success message for 3 seconds
                    setTimeout(() => {
                      setSubmitSuccess(false);
                    }, 3000);
                  }}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
                >
                  SUBMIT RATING
                </Button>
              ) : (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">
                      Rating Submitted
                    </p>
                    <p className="text-sm text-green-700">
                      Your feedback has been sent to the tutor
                    </p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {submitSuccess && (
                <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-pulse">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">Success!</p>
                    <p className="text-sm text-green-700">
                      Your rating has been submitted successfully
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {isScheduled && meeting.link && onJoinClick && (
            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => onJoinClick(meeting)}
                disabled={!joinButtonState.enabled}
                variant={joinButtonState.enabled ? "default" : "outline"}
                className={
                  joinButtonState.enabled
                    ? "flex-1 bg-green-600 hover:bg-green-700 text-white"
                    : "flex-1"
                }
              >
                <Video className="h-4 w-4 mr-2" />
                {joinButtonState.label}
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
