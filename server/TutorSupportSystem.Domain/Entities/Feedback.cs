using System;

namespace TutorSupportSystem.Domain.Entities;

public class Feedback : BaseEntity
{
    public Guid MeetingId { get; set; }
    public Guid StudentId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string Sentiment { get; set; } = string.Empty;

    // Navigations
    public Meeting? Meeting { get; set; }
    public StudentProfile? Student { get; set; }
}
