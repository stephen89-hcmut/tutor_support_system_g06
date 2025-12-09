using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using TutorSupportSystem.Application.DTOs;
using TutorSupportSystem.Application.Interfaces;
using TutorSupportSystem.Domain.Entities;
using TutorSupportSystem.Domain.Enums;
using TutorSupportSystem.Domain.Repositories;
using TutorSupportSystem.Infrastructure.Database;

namespace TutorSupportSystem.Application.Services;

public class MeetingService : IMeetingService
{
    private static readonly SemaphoreSlim BookingLock = new(1, 1);

    private readonly AppDbContext _dbContext;
    private readonly IUnitOfWork _unitOfWork;

    public MeetingService(AppDbContext dbContext, IUnitOfWork unitOfWork)
    {
        _dbContext = dbContext;
        _unitOfWork = unitOfWork;
    }

    public async Task<MeetingDto> CreateMeetingAsync(CreateMeetingRequest request, CancellationToken cancellationToken = default)
    {
        var hasConflict = await _dbContext.Meetings
            .AnyAsync(m => m.TutorId == request.TutorId
                && m.Status != MeetingStatus.Cancelled
                && IsOverlapping(m.StartTime, m.EndTime, request.StartTime, request.EndTime), cancellationToken);

        if (hasConflict)
        {
            throw new InvalidOperationException("Tutor has a conflicting meeting.");
        }

        var meeting = new Meeting
        {
            Title = request.Title,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Mode = request.Mode,
            TutorId = request.TutorId,
            MinCapacity = request.MinCapacity,
            MaxCapacity = request.MaxCapacity,
            CurrentCount = 0,
            Status = MeetingStatus.Open
        };

        await _unitOfWork.Meetings.AddAsync(meeting, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(meeting);
    }

    public async Task<bool> BookMeetingAsync(BookingRequest request, CancellationToken cancellationToken = default)
    {
        await BookingLock.WaitAsync(cancellationToken);
        IDbContextTransaction? transaction = null;
        try
        {
            transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

            var meeting = await _dbContext.Meetings
                .Include(m => m.Participants)
                .FirstOrDefaultAsync(m => m.Id == request.MeetingId, cancellationToken);

            if (meeting is null || meeting.Status == MeetingStatus.Cancelled || meeting.Status == MeetingStatus.Completed)
            {
                return false;
            }

            if (meeting.CurrentCount >= meeting.MaxCapacity)
            {
                return false;
            }

            var studentConflict = await _dbContext.Participants
                .Include(p => p.Meeting)
                .AnyAsync(p => p.StudentId == request.StudentId
                    && p.Meeting != null
                    && p.Meeting.Status != MeetingStatus.Cancelled
                    && IsOverlapping(p.Meeting.StartTime, p.Meeting.EndTime, meeting.StartTime, meeting.EndTime), cancellationToken);

            if (studentConflict)
            {
                return false;
            }

            meeting.Participants.Add(new Participant
            {
                MeetingId = meeting.Id,
                StudentId = request.StudentId,
                Status = "Confirmed"
            });

            meeting.CurrentCount += 1;
            if (meeting.CurrentCount >= meeting.MinCapacity)
            {
                meeting.Status = MeetingStatus.Confirmed;
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return true;
        }
        finally
        {
            if (transaction is not null)
            {
                await transaction.DisposeAsync();
            }
            BookingLock.Release();
        }
    }

    public async Task<bool> CancelMeetingAsync(Guid meetingId, Guid userId, CancellationToken cancellationToken = default)
    {
        await BookingLock.WaitAsync(cancellationToken);
        try
        {
            var meeting = await _dbContext.Meetings
                .Include(m => m.Participants)
                .FirstOrDefaultAsync(m => m.Id == meetingId, cancellationToken);

            if (meeting is null)
            {
                return false;
            }

            var hoursUntilStart = (meeting.StartTime - DateTime.UtcNow).TotalHours;
            if (hoursUntilStart < 24)
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
                if (user is not null)
                {
                    user.WarningCount += 1;
                    _unitOfWork.Users.Update(user);
                }
            }

            meeting.Status = MeetingStatus.Cancelled;
            meeting.CurrentCount = 0;
            meeting.Participants.Clear();

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return true;
        }
        finally
        {
            BookingLock.Release();
        }
    }

    public async Task<IReadOnlyList<MeetingDto>> GetUpcomingForTutorAsync(Guid tutorId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var meetings = await _dbContext.Meetings
            .Where(m => m.TutorId == tutorId && m.StartTime >= now && m.Status != MeetingStatus.Cancelled)
            .OrderBy(m => m.StartTime)
            .ToListAsync(cancellationToken);

        return meetings.Select(MapToDto).ToList();
    }

    private static bool IsOverlapping(DateTime startA, DateTime endA, DateTime startB, DateTime endB)
    {
        return startA < endB && endA > startB;
    }

    private static MeetingDto MapToDto(Meeting meeting)
    {
        return new MeetingDto(
            meeting.Id,
            meeting.Title,
            meeting.StartTime,
            meeting.EndTime,
            meeting.Mode,
            meeting.TutorId,
            meeting.MinCapacity,
            meeting.MaxCapacity,
            meeting.CurrentCount,
            meeting.Status
        );
    }
}
