using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TutorSupportSystem.Application.Interfaces;
using TutorSupportSystem.Domain.Entities;
using TutorSupportSystem.Infrastructure.Database;

namespace TutorSupportSystem.API.Auth;

public class EfRefreshTokenStore : IRefreshTokenStore
{
    private readonly AppDbContext _dbContext;

    public EfRefreshTokenStore(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task StoreAsync(Guid userId, string refreshToken, DateTime expiresAt, CancellationToken cancellationToken = default)
    {
        // rotate: remove existing tokens for this user if needed or allow multiple; here allow multiple
        var entity = new RefreshToken
        {
            UserId = userId,
            Token = refreshToken,
            ExpiresAt = expiresAt,
            IsRevoked = false
        };

        await _dbContext.RefreshTokens.AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<Guid?> ValidateAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.RefreshTokens
            .FirstOrDefaultAsync(r => r.Token == refreshToken && !r.IsRevoked, cancellationToken);

        if (entity is null)
        {
            return null;
        }

        if (entity.ExpiresAt <= DateTime.UtcNow)
        {
            return null;
        }

        return entity.UserId;
    }

    public async Task RevokeAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.RefreshTokens.FirstOrDefaultAsync(r => r.Token == refreshToken, cancellationToken);
        if (entity is null)
        {
            return;
        }

        entity.IsRevoked = true;
        _dbContext.RefreshTokens.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
