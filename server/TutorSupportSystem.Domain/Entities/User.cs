using System.Collections.Generic;
using TutorSupportSystem.Domain.Enums;

namespace TutorSupportSystem.Domain.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public int WarningCount { get; set; }

    // Navigations
    public StudentProfile? StudentProfile { get; set; }
    public TutorProfile? TutorProfile { get; set; }
    public ICollection<Meeting> TutorMeetings { get; set; } = new List<Meeting>();
    public ICollection<Participant> Participations { get; set; } = new List<Participant>();
    public ICollection<ProgressRecord> ProgressRecords { get; set; } = new List<ProgressRecord>();
}
