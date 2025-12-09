using System;
using TutorSupportSystem.Domain.Enums;

namespace TutorSupportSystem.Application.DTOs;

public record MeetingDto
(
    Guid Id,
    string Title,
    DateTime StartTime,
    DateTime EndTime,
    MeetingMode Mode,
    Guid TutorId,
    int MinCapacity,
    int MaxCapacity,
    int CurrentCount,
    MeetingStatus Status
);

public record CreateMeetingRequest
(
    string Title,
    DateTime StartTime,
    DateTime EndTime,
    MeetingMode Mode,
    Guid TutorId,
    int MinCapacity,
    int MaxCapacity
);

public record BookingRequest(Guid MeetingId, Guid StudentId);
