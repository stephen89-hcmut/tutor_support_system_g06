using System;
using System.ComponentModel.DataAnnotations;
using TutorSupportSystem.Domain.Enums;

namespace TutorSupportSystem.Application.DTOs;

public class TutorRegistrationDto
{
    [Required]
    public Guid UserId { get; set; }

    public TutorType Type { get; set; } = TutorType.SeniorStudent;

    [StringLength(2000)]
    public string? Bio { get; set; }

    [StringLength(500)]
    public string? Expertise { get; set; }

    [StringLength(500)]
    public string? CertificatesUrl { get; set; }
}
