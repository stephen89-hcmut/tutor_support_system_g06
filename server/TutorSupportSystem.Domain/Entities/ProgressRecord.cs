using System;

namespace TutorSupportSystem.Domain.Entities;

public class ProgressRecord : BaseEntity
{
    public Guid MeetingId { get; set; }
    public Guid StudentId { get; set; }
    public Guid TutorId { get; set; }

    // Scores
    public int Understanding { get; set; }
    public int ProblemSolving { get; set; }
    public int CodeQuality { get; set; }
    public int Participation { get; set; }
    public double? OverallScore { get; set; }

    public string? TutorComments { get; set; }
    public string? PrivateNote { get; set; }

    // Navigations
    public Meeting? Meeting { get; set; }
    public StudentProfile? Student { get; set; }
}
