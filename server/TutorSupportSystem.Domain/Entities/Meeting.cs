using TutorSupportSystem.Domain.Enums;

namespace TutorSupportSystem.Domain.Entities;

public class Meeting : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public MeetingMode Mode { get; set; }
    public string? Location { get; set; }
    public Guid TutorId { get; set; }
    public int MinCapacity { get; set; }
    public int MaxCapacity { get; set; }
    public int CurrentCount { get; set; }
    public MeetingStatus Status { get; set; } = MeetingStatus.Open;

    // Navigation
    public User Tutor { get; set; } = null!;
    public ICollection<Participant> Participants { get; set; } = new List<Participant>();
    public ICollection<ProgressRecord> ProgressRecords { get; set; } = new List<ProgressRecord>();
    public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
}
