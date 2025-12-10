using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using TutorSupportSystem.Domain.Interfaces;

namespace TutorSupportSystem.Infrastructure.Auth;

public class HttpUserContext : IUserContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<HttpUserContext> _logger;

    public HttpUserContext(IHttpContextAccessor httpContextAccessor, ILogger<HttpUserContext> logger)
    {
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public Guid GetCurrentUserId()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext?.User == null)
        {
            throw new InvalidOperationException("No active HTTP context or user is not available.");
        }

        var raw = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? httpContext.User.FindFirstValue("sub")
                  ?? httpContext.User.FindFirstValue("uid");

        if (!Guid.TryParse(raw, out var userId))
        {
            _logger.LogWarning("Unable to resolve current user id from claims. Raw value: {RawValue}", raw ?? "<null>");
            throw new InvalidOperationException("Current user is not authenticated.");
        }

        return userId;
    }
}
