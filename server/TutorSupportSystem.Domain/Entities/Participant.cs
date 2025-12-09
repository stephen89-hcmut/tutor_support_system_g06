using System;

namespace TutorSupportSystem.Domain.Entities;

public class Participant : BaseEntity
{
    public Guid MeetingId { get; set; }
    public Guid StudentId { get; set; }
    public string Status { get; set; } = "Confirmed";

    // Navigations
    public Meeting? Meeting { get; set; }
    public StudentProfile? Student { get; set; }
}
