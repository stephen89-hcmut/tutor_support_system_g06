using System;
using TutorSupportSystem.Domain.Enums;

namespace TutorSupportSystem.Domain.Entities;

public class Feedback : BaseEntity
{
    public Guid MeetingId { get; set; }
    public Guid StudentId { get; set; }
    public Guid TutorId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public SentimentType Sentiment { get; set; } = SentimentType.Neutral;
        public string? TutorReply { get; set; }
        public bool IsHidden { get; set; } = false;

    // Navigations
    public Meeting? Meeting { get; set; }
    public StudentProfile? Student { get; set; }
    public TutorProfile? Tutor { get; set; }
}
