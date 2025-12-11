using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TutorSupportSystem.Application.DTOs;

namespace TutorSupportSystem.Application.Interfaces;

public interface IMeetingService
{
    Task<MeetingDto> CreateSlotAsync(CreateMeetingRequest request, CancellationToken cancellationToken = default);
    Task JoinMeetingAsync(Guid meetingId, CancellationToken cancellationToken = default);
    Task CancelMeetingAsync(Guid meetingId, string reason, CancellationToken cancellationToken = default);
    Task StartMeetingAsync(Guid meetingId, CancellationToken cancellationToken = default);
    Task FinishMeetingAsync(Guid meetingId, CancellationToken cancellationToken = default);
    Task SubmitAttendanceAsync(Guid meetingId, List<AttendanceEntry> attendance, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MeetingDto>> GetMyMeetingsAsync(CancellationToken cancellationToken = default);
    Task<MeetingDto> GetMeetingByIdAsync(Guid meetingId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MeetingDto>> GetTutorStudentsAsync(string tutorId, CancellationToken cancellationToken = default);
}
