using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TutorSupportSystem.Application.DTOs;
using TutorSupportSystem.Application.Interfaces;
using TutorSupportSystem.Domain.Entities;
using TutorSupportSystem.Domain.Enums;
using TutorSupportSystem.Domain.Repositories;

namespace TutorSupportSystem.Application.Services;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;

    public UserService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task RegisterAsTutorAsync(TutorRegistrationDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(dto.UserId, cancellationToken)
                   ?? throw new InvalidOperationException("User not found");

        var existingProfile = (await _unitOfWork.TutorProfiles.FindAsync(tp => tp.UserId == dto.UserId, cancellationToken)).FirstOrDefault();
        if (existingProfile is not null)
        {
            throw new InvalidOperationException("Tutor profile already exists.");
        }

        var profile = new TutorProfile
        {
            UserId = dto.UserId,
            TutorCode = $"TUT-{Guid.NewGuid():N}"[..10],
            Type = dto.Type,
            Status = TutorStatus.Pending,
            Bio = dto.Bio,
            Expertise = dto.Expertise,
            CertificatesUrl = dto.CertificatesUrl
        };

        await _unitOfWork.TutorProfiles.AddAsync(profile, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ApproveTutorAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken)
                   ?? throw new InvalidOperationException("User not found");

        var profile = (await _unitOfWork.TutorProfiles.FindAsync(tp => tp.UserId == userId, cancellationToken)).FirstOrDefault()
                      ?? throw new InvalidOperationException("Tutor profile not found");

        profile.Status = TutorStatus.Approved;
        user.Role = UserRole.Tutor;

        _unitOfWork.TutorProfiles.Update(profile);
        _unitOfWork.Users.Update(user);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
