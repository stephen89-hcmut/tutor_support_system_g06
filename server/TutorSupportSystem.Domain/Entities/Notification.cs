namespace TutorSupportSystem.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "System"; // Booking, Warning, Reminder
    public bool IsRead { get; set; } = false;

    // Navigation
    public User User { get; set; } = null!;
}