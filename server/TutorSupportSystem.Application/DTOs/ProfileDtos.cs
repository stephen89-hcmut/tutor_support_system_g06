using System;
using System.Collections.Generic;

namespace TutorSupportSystem.Application.DTOs;

public record TutorProfileDto
(
    Guid Id,
    Guid UserId,
    string TutorCode,
    ICollection<string> Expertise,
    double AverageRating
);

public record StudentProfileDto
(
    Guid Id,
    Guid UserId,
    string StudentCode,
    string Major,
    ICollection<string> WeakSubjects
);

public record TutorMatchResult
(
    Guid TutorId,
    Guid UserId,
    string TutorCode,
    string FullName,
    double AverageRating,
    double MatchPercentage,
    ICollection<string> Expertise
);
