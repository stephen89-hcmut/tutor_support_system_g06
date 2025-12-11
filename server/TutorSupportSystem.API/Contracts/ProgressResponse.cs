using System;

namespace TutorSupportSystem.API.Contracts;

public record ProgressResponse(
    Guid Id,
    Guid MeetingId,
    DateTime Date,
    string Subject,
    string TutorName,
    string? TutorAvatar,
    string Attendance,
    int Understanding,
    int Practice,
    int Engagement,
    string Comment,
    bool HasMaterials,
    bool IsTutorRated
);
