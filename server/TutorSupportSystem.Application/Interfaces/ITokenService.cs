using System;
using TutorSupportSystem.Application.DTOs;
using TutorSupportSystem.Domain.Entities;

namespace TutorSupportSystem.Application.Interfaces;

public interface ITokenService
{
    TokenPair GenerateTokens(User user);
}

public record TokenPair(string AccessToken, DateTime AccessTokenExpiresAt, string RefreshToken, DateTime RefreshTokenExpiresAt);
