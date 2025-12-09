using TutorSupportSystem.Domain.Enums;

namespace TutorSupportSystem.Domain.Entities;

public class TutorProfile : BaseEntity
{
  public Guid UserId { get; set; }
  public string TutorCode { get; set; } = string.Empty;
  public TutorType Type { get; set; } = TutorType.Instructor;
  public TutorStatus Status { get; set; } = TutorStatus.Pending;
  public string? Bio { get; set; }
  public string? Expertise { get; set; }
  public string? TeachingMethod { get; set; }
  public string? CertificatesUrl { get; set; }
  public double AverageRating { get; set; } = 5.0;
  public int TotalReviews { get; set; } = 0;
  public double TotalTeachingHours { get; set; } = 0;

  // Navigation
  public User User { get; set; } = null!;
  public ICollection<Meeting> Meetings { get; set; } = new List<Meeting>();
  public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
}
