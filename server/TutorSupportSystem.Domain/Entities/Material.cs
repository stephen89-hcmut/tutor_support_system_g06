namespace TutorSupportSystem.Domain.Entities;

public class Material : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string? LibraryResourceId { get; set; }
    public string? FileUrl { get; set; }
    public Guid UploadedBy { get; set; }
    public Guid? SharedWithMeetingId { get; set; }

    // Navigation
    public User Uploader { get; set; } = null!;
}