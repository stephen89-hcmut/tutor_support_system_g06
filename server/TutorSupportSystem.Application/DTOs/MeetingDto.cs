using System.ComponentModel.DataAnnotations;
using TutorSupportSystem.Domain.Enums;

namespace TutorSupportSystem.Application.DTOs;

public class MeetingDto
{
    public Guid Id { get; init; }

    [Required, StringLength(200)]
    public string Subject { get; init; } = string.Empty;

    // Backward compatibility: keep Title mapped to Subject
    public string Title
    {
        get => Subject;
        init => Subject = value;
    }

    [Required]
    public DateTime StartTime { get; init; }

    [Required]
    public DateTime EndTime { get; init; }

    [Required, EnumDataType(typeof(MeetingMode))]
    public MeetingMode Mode { get; init; }

    [StringLength(500)]
    public string? Link { get; init; }

    [StringLength(500)]
    public string? Location { get; init; }

    [Range(1, int.MaxValue)]
    public int MinCapacity { get; init; }

    [Range(1, int.MaxValue)]
    public int MaxCapacity { get; init; }

    public int CurrentCount { get; init; }

    public string Status { get; init; } = string.Empty;

    public Guid TutorId { get; init; }

    [StringLength(200)]
    public string TutorName { get; init; } = string.Empty;
}

public class CreateMeetingRequest
{
    [Required, StringLength(200)]
    public string Subject { get; set; } = string.Empty;

    // Backward compatibility: Title maps to Subject
    public string Title
    {
        get => Subject;
        set => Subject = value;
    }

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }

    [Required, EnumDataType(typeof(MeetingMode))]
    public MeetingMode Mode { get; set; }

    [StringLength(500)]
    public string? Link { get; set; }

    [StringLength(500)]
    public string? Location { get; set; }

    [Required]
    public Guid TutorId { get; set; }

    [Range(1, int.MaxValue)]
    public int MinCapacity { get; set; } = 6;

    [Range(1, int.MaxValue)]
    public int MaxCapacity { get; set; } = 10;
}

public class JoinMeetingRequest
{
    [Required]
    public Guid MeetingId { get; set; }

    public Guid StudentId { get; set; } // optional if resolved from auth context
}

public class CancelMeetingRequest
{
    [Required]
    public Guid MeetingId { get; set; }

    [Required, StringLength(500)]
    public string Reason { get; set; } = string.Empty;
}

public class AttendanceEntry
{
    [Required]
    public Guid StudentId { get; set; }

    public bool IsPresent { get; set; }
}

public class AttendanceRequest
{
    [Required]
    public Guid MeetingId { get; set; }

    [Required, MinLength(1)]
    public List<AttendanceEntry> Entries { get; set; } = new();
}

// Legacy DTO kept for existing flows; can be phased out in favor of JoinMeetingRequest
public record BookingRequest(Guid MeetingId, Guid StudentId);
