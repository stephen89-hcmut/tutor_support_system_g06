using System;
using System.Threading;
using System.Threading.Tasks;

namespace TutorSupportSystem.Application.Interfaces;

public interface IRefreshTokenStore
{
    Task StoreAsync(Guid userId, string refreshToken, DateTime expiresAt, CancellationToken cancellationToken = default);
    Task<Guid?> ValidateAsync(string refreshToken, CancellationToken cancellationToken = default);
    Task RevokeAsync(string refreshToken, CancellationToken cancellationToken = default);
}
