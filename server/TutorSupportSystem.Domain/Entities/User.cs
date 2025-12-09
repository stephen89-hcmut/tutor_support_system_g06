using TutorSupportSystem.Domain.Enums;

namespace TutorSupportSystem.Domain.Entities;

public class User : BaseEntity
{
    public string SsoId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public UserRole Role { get; set; }
    public int WarningCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public StudentProfile? StudentProfile { get; set; }
    public TutorProfile? TutorProfile { get; set; }
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<Meeting> TutorMeetings { get; set; } = new List<Meeting>();
    public ICollection<Participant> Participations { get; set; } = new List<Participant>();
    public ICollection<ProgressRecord> ProgressRecords { get; set; } = new List<ProgressRecord>();
}
