using System;

namespace TutorSupportSystem.API.Contracts;

public record ProgressRequest(
    Guid MeetingId,
    Guid StudentId,
    int Understanding,
    int ProblemSolving,
    int CodeQuality,
    int Participation,
    string? TutorComments,
    string? PrivateNote
);
