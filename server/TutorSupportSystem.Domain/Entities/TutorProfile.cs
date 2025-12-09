using System;
using System.Collections.Generic;

namespace TutorSupportSystem.Domain.Entities;

public class TutorProfile : BaseEntity
{
    public Guid UserId { get; set; }
    public string TutorCode { get; set; } = string.Empty;
    public ICollection<string> Expertise { get; set; } = new List<string>();
    public double AverageRating { get; set; }

    // Navigations
    public User? User { get; set; }
    public ICollection<Meeting> Meetings { get; set; } = new List<Meeting>();
    public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
}
