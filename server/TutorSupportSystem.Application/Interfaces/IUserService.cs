using System;
using System.Threading;
using System.Threading.Tasks;
using TutorSupportSystem.Application.DTOs;

namespace TutorSupportSystem.Application.Interfaces;

public interface IUserService
{
    Task RegisterAsTutorAsync(TutorRegistrationDto dto, CancellationToken cancellationToken = default);
    Task ApproveTutorAsync(Guid userId, CancellationToken cancellationToken = default);
}
