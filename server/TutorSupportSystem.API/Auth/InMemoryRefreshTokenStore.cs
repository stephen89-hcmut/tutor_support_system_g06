using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;
using TutorSupportSystem.Application.Interfaces;

namespace TutorSupportSystem.API.Auth;

public class InMemoryRefreshTokenStore : IRefreshTokenStore
{
    private readonly ConcurrentDictionary<string, (Guid UserId, DateTime ExpiresAt)> _store = new();

    public Task StoreAsync(Guid userId, string refreshToken, DateTime expiresAt, CancellationToken cancellationToken = default)
    {
        _store[refreshToken] = (userId, expiresAt);
        return Task.CompletedTask;
    }

    public Task<Guid?> ValidateAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        if (_store.TryGetValue(refreshToken, out var record))
        {
            if (record.ExpiresAt > DateTime.UtcNow)
            {
                return Task.FromResult<Guid?>(record.UserId);
            }
        }

        return Task.FromResult<Guid?>(null);
    }

    public Task RevokeAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        _store.TryRemove(refreshToken, out _);
        return Task.CompletedTask;
    }
}
