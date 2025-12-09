namespace TutorSupportSystem.Domain.Entities;

public class StudentProfile : BaseEntity
{
    public Guid UserId { get; set; }
    public string StudentCode { get; set; } = string.Empty;
    public string Faculty { get; set; } = string.Empty;
    public string Major { get; set; } = string.Empty;
    public int EnrollmentYear { get; set; }
    public string? WeakSubjects { get; set; }
    public string? LearningStyles { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<Participant> Participations { get; set; } = new List<Participant>();
    public ICollection<ProgressRecord> ProgressRecords { get; set; } = new List<ProgressRecord>();
    public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
}
