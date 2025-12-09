using System;
using System.Collections.Generic;

namespace TutorSupportSystem.Domain.Entities;

public class StudentProfile : BaseEntity
{
    public Guid UserId { get; set; }
    public string StudentCode { get; set; } = string.Empty;
    public string Major { get; set; } = string.Empty;
    public ICollection<string> WeakSubjects { get; set; } = new List<string>();

    // Navigations
    public User? User { get; set; }
    public ICollection<Participant> Participations { get; set; } = new List<Participant>();
    public ICollection<ProgressRecord> ProgressRecords { get; set; } = new List<ProgressRecord>();
    public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
}
