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

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenService _tokenService;
    private readonly IRefreshTokenStore _refreshTokenStore;

    public AuthService(IUnitOfWork unitOfWork, ITokenService tokenService, IRefreshTokenStore refreshTokenStore)
    {
        _unitOfWork = unitOfWork;
        _tokenService = tokenService;
        _refreshTokenStore = refreshTokenStore;
    }

    public async Task<AuthResponse> LoginWithSsoAsync(string ssoTicket, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(ssoTicket))
        {
            throw new InvalidOperationException("Ticket is required.");
        }

        var ssoId = ssoTicket.Trim();

        // Try matching existing user by SSO ID first, then by email if ticket looks like one
        var user = (await _unitOfWork.Users.FindAsync(u => u.SsoId == ssoId, cancellationToken)).FirstOrDefault();
        user ??= ssoId.Contains('@')
            ? (await _unitOfWork.Users.FindAsync(u => u.Email == ssoId, cancellationToken)).FirstOrDefault()
            : null;

        if (user is null)
        {
            // Fallback: create a new user inferred from the ticket (student if ticket contains "student")
            var email = ssoId.Contains('@')
                ? ssoId
                : ssoId.Contains("student", StringComparison.OrdinalIgnoreCase)
                    ? $"{ssoId.ToLowerInvariant()}@student.hcmut.edu.vn"
                    : $"{ssoId.ToLowerInvariant()}@hcmut.edu.vn";

            var fullName = "Mock User";

            user = new User
            {
                SsoId = ssoId,
                Email = email,
                FullName = fullName,
                Role = InferRoleFromEmail(email),
                IsActive = true
            };
            await _unitOfWork.Users.AddAsync(user, cancellationToken);
        }
        else
        {
            if (!user.IsActive)
            {
                throw new InvalidOperationException("Tài khoản bị khóa.");
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var tokens = _tokenService.GenerateTokens(user);
        await _refreshTokenStore.StoreAsync(user.Id, tokens.RefreshToken, tokens.RefreshTokenExpiresAt, cancellationToken);

        return new AuthResponse
        {
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role.ToString(),
            FullName = user.FullName,
            AccessToken = tokens.AccessToken,
            AccessTokenExpiresAt = tokens.AccessTokenExpiresAt,
            RefreshToken = tokens.RefreshToken,
            RefreshTokenExpiresAt = tokens.RefreshTokenExpiresAt
        };
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var userId = await _refreshTokenStore.ValidateAsync(refreshToken, cancellationToken)
            ?? throw new InvalidOperationException("Invalid refresh token");

        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken)
                   ?? throw new InvalidOperationException("User not found");

        if (!user.IsActive)
        {
            throw new InvalidOperationException("Tài khoản bị khóa.");
        }

        var tokens = _tokenService.GenerateTokens(user);
        await _refreshTokenStore.StoreAsync(user.Id, tokens.RefreshToken, tokens.RefreshTokenExpiresAt, cancellationToken);

        return new AuthResponse
        {
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role.ToString(),
            FullName = user.FullName,
            AccessToken = tokens.AccessToken,
            AccessTokenExpiresAt = tokens.AccessTokenExpiresAt,
            RefreshToken = tokens.RefreshToken,
            RefreshTokenExpiresAt = tokens.RefreshTokenExpiresAt
        };
    }

    private static UserRole InferRoleFromEmail(string email)
    {
        if (email.EndsWith("student.hcmut.edu.vn", StringComparison.OrdinalIgnoreCase))
        {
            return UserRole.Student;
        }

        return UserRole.Tutor;
    }
}
