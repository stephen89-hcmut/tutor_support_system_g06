using System.Threading;
using System.Threading.Tasks;
using TutorSupportSystem.Application.DTOs;

namespace TutorSupportSystem.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> LoginWithSsoAsync(string ssoTicket, CancellationToken cancellationToken = default);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
}
