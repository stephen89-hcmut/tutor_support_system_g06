using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Transactions;
using Microsoft.Extensions.Logging;
using TutorSupportSystem.Application.DTOs;
using TutorSupportSystem.Application.Interfaces;
using TutorSupportSystem.Domain.Entities;
using TutorSupportSystem.Domain.Enums;
using TutorSupportSystem.Domain.Interfaces;
using TutorSupportSystem.Domain.Repositories;

namespace TutorSupportSystem.Application.Services;

public class MeetingService : IMeetingService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly ILogger<MeetingService> _logger;

    public MeetingService(IUnitOfWork unitOfWork, IUserContext userContext, ILogger<MeetingService> logger)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _logger = logger;
    }

    public async Task<MeetingDto> CreateSlotAsync(CreateMeetingRequest request, CancellationToken cancellationToken = default)
    {
        var utcNow = DateTime.UtcNow;
        if (request.StartTime < utcNow.AddHours(48))
        {
            throw new InvalidOperationException("Start time must be at least 48 hours from now.");
        }

        if (request.EndTime <= request.StartTime)
        {
            throw new InvalidOperationException("End time must be after start time.");
        }

        var existingMeetings = await _unitOfWork.Meetings.FindAsync(
            m => m.TutorId == request.TutorId
                 && m.Status != MeetingStatus.CancelledByTutor
                 && m.Status != MeetingStatus.CancelledBySystem,
            cancellationToken);

        var tutorHasConflict = existingMeetings.Any(m => IsOverlapping(m.StartTime, m.EndTime, request.StartTime, request.EndTime));
        if (tutorHasConflict)
        {
            throw new InvalidOperationException("Tutor has a conflicting meeting.");
        }

        var meeting = new Meeting
        {
            Title = request.Subject,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Mode = request.Mode,
            TutorId = request.TutorId,
            Location = request.Location ?? request.Link,
            MinCapacity = 6,
            MaxCapacity = 10,
            CurrentCount = 0,
            Status = MeetingStatus.Open
        };

        await _unitOfWork.Meetings.AddAsync(meeting, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created meeting slot {MeetingId} for tutor {TutorId} between {Start} and {End}", meeting.Id, meeting.TutorId, meeting.StartTime, meeting.EndTime);

        return MapToDto(meeting);
    }

    public async Task JoinMeetingAsync(Guid meetingId, CancellationToken cancellationToken = default)
    {
        var studentId = _userContext.GetCurrentUserId();

        var transactionOptions = new TransactionOptions
        {
            IsolationLevel = IsolationLevel.Serializable
        };

        using var scope = new TransactionScope(TransactionScopeOption.Required, transactionOptions, TransactionScopeAsyncFlowOption.Enabled);

        var meeting = await _unitOfWork.Meetings.GetByIdAsync(meetingId, cancellationToken);
        if (meeting is null)
        {
            throw new KeyNotFoundException("Meeting not found.");
        }

        if (meeting.Status != MeetingStatus.Open)
        {
            throw new InvalidOperationException("Only open meetings can be joined.");
        }

        if (meeting.CurrentCount >= meeting.MaxCapacity)
        {
            throw new InvalidOperationException("Meeting is already full.");
        }

        var alreadyRegistered = await _unitOfWork.Participants.FindAsync(
            p => p.MeetingId == meetingId && p.StudentId == studentId,
            cancellationToken);

        if (alreadyRegistered.Any())
        {
            throw new InvalidOperationException("Student has already joined this meeting.");
        }

        var studentParticipations = await _unitOfWork.Participants.FindAsync(
            p => p.StudentId == studentId,
            cancellationToken);

        var participantMeetingIds = studentParticipations
            .Where(p => p.MeetingId != meetingId)
            .Select(p => p.MeetingId)
            .Distinct()
            .ToList();

        if (participantMeetingIds.Count > 0)
        {
            var otherMeetings = await _unitOfWork.Meetings.FindAsync(
                m => participantMeetingIds.Contains(m.Id)
                     && m.Status != MeetingStatus.CancelledByTutor
                     && m.Status != MeetingStatus.CancelledBySystem,
                cancellationToken);

            var hasConflict = otherMeetings.Any(m => IsOverlapping(m.StartTime, m.EndTime, meeting.StartTime, meeting.EndTime));
            if (hasConflict)
            {
                throw new InvalidOperationException("Student has a scheduling conflict with another meeting.");
            }
        }

        var participant = new Participant
        {
            MeetingId = meeting.Id,
            StudentId = studentId,
            Status = ParticipantStatus.Registered
        };

        await _unitOfWork.Participants.AddAsync(participant, cancellationToken);

        meeting.CurrentCount += 1;
        if (meeting.CurrentCount >= meeting.MaxCapacity)
        {
            meeting.Status = MeetingStatus.Full;
        }

        _unitOfWork.Meetings.Update(meeting);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        scope.Complete();

        _logger.LogInformation("Student {StudentId} joined meeting {MeetingId}. CurrentCount={CurrentCount}", studentId, meeting.Id, meeting.CurrentCount);
    }

    public async Task CancelMeetingAsync(Guid meetingId, string reason, CancellationToken cancellationToken = default)
    {
        var userId = _userContext.GetCurrentUserId();
        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken)
                   ?? throw new InvalidOperationException("User not found.");

        var meeting = await _unitOfWork.Meetings.GetByIdAsync(meetingId, cancellationToken)
                      ?? throw new KeyNotFoundException("Meeting not found.");

        var hoursUntilStart = (meeting.StartTime - DateTime.UtcNow).TotalHours;

        if (user.Role == UserRole.Student)
        {
            var participantList = await _unitOfWork.Participants.FindAsync(
                p => p.MeetingId == meetingId && p.StudentId == userId,
                cancellationToken);

            var participant = participantList.FirstOrDefault();
            if (participant is null)
            {
                throw new InvalidOperationException("Student is not registered for this meeting.");
            }

            if (hoursUntilStart < 24)
            {
                throw new InvalidOperationException("Không thể rút lui trong vòng 24h. Bạn sẽ bị tính là Vắng mặt.");
            }

            participant.Status = ParticipantStatus.Withdrawn;
            _unitOfWork.Participants.Update(participant);

            meeting.CurrentCount = Math.Max(0, meeting.CurrentCount - 1);
            if (meeting.Status == MeetingStatus.Full)
            {
                meeting.Status = MeetingStatus.Open;
            }

            _unitOfWork.Meetings.Update(meeting);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Student {StudentId} withdrew from meeting {MeetingId}. Reason={Reason}", userId, meetingId, reason);
            return;
        }

        if (user.Role == UserRole.Tutor && meeting.TutorId == userId)
        {
            meeting.Status = MeetingStatus.CancelledByTutor;

            if (hoursUntilStart < 24)
            {
                user.WarningCount += 1;
                _unitOfWork.Users.Update(user);
            }

            _unitOfWork.Meetings.Update(meeting);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogWarning("Tutor {TutorId} cancelled meeting {MeetingId} within {HoursUntilStart:F1}h. Reason={Reason}", userId, meetingId, hoursUntilStart, reason);
            return;
        }

        throw new InvalidOperationException("User is not allowed to cancel this meeting.");
    }

    public async Task StartMeetingAsync(Guid meetingId, CancellationToken cancellationToken = default)
    {
        var meeting = await _unitOfWork.Meetings.GetByIdAsync(meetingId, cancellationToken)
                      ?? throw new KeyNotFoundException("Meeting not found.");

        if (meeting.Status != MeetingStatus.Confirmed)
        {
            throw new InvalidOperationException("Only confirmed meetings can be started.");
        }

        meeting.Status = MeetingStatus.InProgress;
        _unitOfWork.Meetings.Update(meeting);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Meeting {MeetingId} started", meetingId);
    }

    public async Task FinishMeetingAsync(Guid meetingId, CancellationToken cancellationToken = default)
    {
        var meeting = await _unitOfWork.Meetings.GetByIdAsync(meetingId, cancellationToken)
                      ?? throw new KeyNotFoundException("Meeting not found.");

        if (meeting.Status != MeetingStatus.InProgress)
        {
            throw new InvalidOperationException("Only meetings in progress can be completed.");
        }

        meeting.Status = MeetingStatus.Completed;
        _unitOfWork.Meetings.Update(meeting);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Meeting {MeetingId} completed", meetingId);
    }

    public async Task SubmitAttendanceAsync(Guid meetingId, List<AttendanceEntry> attendance, CancellationToken cancellationToken = default)
    {
        var meeting = await _unitOfWork.Meetings.GetByIdAsync(meetingId, cancellationToken)
                      ?? throw new KeyNotFoundException("Meeting not found.");

        if (meeting.Status != MeetingStatus.Completed)
        {
            throw new InvalidOperationException("Attendance can only be submitted after meeting is completed.");
        }

        // Fetch participants involved
        var participantIds = attendance.Select(a => a.StudentId).ToHashSet();
        var participants = await _unitOfWork.Participants.FindAsync(
            p => p.MeetingId == meetingId && participantIds.Contains(p.StudentId),
            cancellationToken);

        foreach (var entry in attendance)
        {
            var participant = participants.FirstOrDefault(p => p.StudentId == entry.StudentId);
            if (participant is null)
            {
                continue; // ignore entries not part of the meeting
            }

            participant.Status = entry.IsPresent ? ParticipantStatus.Present : ParticipantStatus.Absent;
            _unitOfWork.Participants.Update(participant);

            if (!entry.IsPresent)
            {
                var user = await _unitOfWork.Users.GetByIdAsync(entry.StudentId, cancellationToken);
                if (user is not null)
                {
                    user.WarningCount += 1;
                    if (user.WarningCount >= 3)
                    {
                        user.IsActive = false;
                    }

                    _unitOfWork.Users.Update(user);
                }
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Attendance submitted for meeting {MeetingId}", meetingId);
    }

    public async Task<IReadOnlyList<MeetingDto>> GetMyMeetingsAsync(CancellationToken cancellationToken = default)
    {
        var userId = _userContext.GetCurrentUserId();
        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken)
                   ?? throw new InvalidOperationException("User not found.");

        IReadOnlyList<Meeting> meetings;

        if (user.Role == UserRole.Tutor)
        {
            meetings = await _unitOfWork.Meetings.FindAsync(m => m.TutorId == userId, cancellationToken);
        }
        else if (user.Role == UserRole.Student)
        {
            var participations = await _unitOfWork.Participants.FindAsync(p => p.StudentId == userId, cancellationToken);
            var meetingIds = participations.Select(p => p.MeetingId).Distinct().ToList();
            meetings = meetingIds.Count == 0
                ? Array.Empty<Meeting>()
                : await _unitOfWork.Meetings.FindAsync(m => meetingIds.Contains(m.Id), cancellationToken);
        }
        else
        {
            // Manager or other roles: return all
            meetings = await _unitOfWork.Meetings.GetAllAsync(cancellationToken);
        }

        return meetings
            .OrderBy(m => m.StartTime)
            .Select(MapToDto)
            .ToList();
    }

    public async Task<MeetingDto> GetMeetingByIdAsync(Guid meetingId, CancellationToken cancellationToken = default)
    {
        var userId = _userContext.GetCurrentUserId();
        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken)
                   ?? throw new InvalidOperationException("User not found.");

        var meeting = await _unitOfWork.Meetings.GetByIdAsync(meetingId, cancellationToken)
                      ?? throw new KeyNotFoundException("Meeting not found.");

        var authorized = user.Role switch
        {
            UserRole.Manager => true,
            UserRole.Tutor => meeting.TutorId == userId,
            UserRole.Student => (await _unitOfWork.Participants.FindAsync(p => p.MeetingId == meetingId && p.StudentId == userId, cancellationToken)).Any(),
            _ => false
        };

        if (!authorized)
        {
            throw new UnauthorizedAccessException("User is not allowed to view this meeting.");
        }

        return MapToDto(meeting);
    }

    private static bool IsOverlapping(DateTime startA, DateTime endA, DateTime startB, DateTime endB)
    {
        return startA < endB && endA > startB;
    }

    private static MeetingDto MapToDto(Meeting meeting)
    {
        return new MeetingDto
        {
            Id = meeting.Id,
            Subject = meeting.Title,
            StartTime = meeting.StartTime,
            EndTime = meeting.EndTime,
            Mode = meeting.Mode,
            Location = meeting.Location,
            MinCapacity = meeting.MinCapacity,
            MaxCapacity = meeting.MaxCapacity,
            CurrentCount = meeting.CurrentCount,
            Status = meeting.Status.ToString(),
            TutorId = meeting.TutorId,
            TutorName = meeting.Tutor?.FullName ?? string.Empty
        };
    }
}
