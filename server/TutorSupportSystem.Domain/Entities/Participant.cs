using TutorSupportSystem.Domain.Enums;

namespace TutorSupportSystem.Domain.Entities;

public class Participant : BaseEntity
{
    public Guid MeetingId { get; set; }
    public Guid StudentId { get; set; }
    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
    public ParticipantStatus Status { get; set; } = ParticipantStatus.Registered;
    public string? Note { get; set; }

    // Navigation
    public Meeting Meeting { get; set; } = null!;
    public User Student { get; set; } = null!;
}
