namespace TutorSupportSystem.Domain.Entities;

public class TutorSuggestion : BaseEntity
{
    public Guid StudentId { get; set; }
    public Guid TutorId { get; set; }
    public double MatchScore { get; set; }
    public string? MatchingReason { get; set; }

    // Navigation
    public TutorProfile Tutor { get; set; } = null!;
}