using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TutorSupportSystem.Application.DTOs;

namespace TutorSupportSystem.Application.Interfaces;

public interface IMeetingService
{
    Task<MeetingDto> CreateMeetingAsync(CreateMeetingRequest request, CancellationToken cancellationToken = default);
    Task<bool> BookMeetingAsync(BookingRequest request, CancellationToken cancellationToken = default);
    Task<bool> CancelMeetingAsync(Guid meetingId, Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MeetingDto>> GetUpcomingForTutorAsync(Guid tutorId, CancellationToken cancellationToken = default);
}
