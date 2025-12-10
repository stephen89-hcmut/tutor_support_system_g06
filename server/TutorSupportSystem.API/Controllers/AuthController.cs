using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorSupportSystem.Application.DTOs;
using TutorSupportSystem.Application.Interfaces;

namespace TutorSupportSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserService _userService;

    public AuthController(IAuthService authService, IUserService userService)
    {
        _authService = authService;
        _userService = userService;
    }

    public record LoginSsoRequest(string Ticket);
    public record RefreshRequest(string RefreshToken);

    [HttpPost("login-sso")]
    [AllowAnonymous]
    public async Task<IActionResult> LoginSso([FromBody] LoginSsoRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _authService.LoginWithSsoAsync(request.Ticket, cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("refresh-token")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _authService.RefreshTokenAsync(request.RefreshToken, cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("register-tutor")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> RegisterTutor([FromBody] TutorRegistrationDto dto, CancellationToken cancellationToken)
    {
        try
        {
            await _userService.RegisterAsTutorAsync(dto, cancellationToken);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("approve-tutor/{userId:guid}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> ApproveTutor(Guid userId, CancellationToken cancellationToken)
    {
        try
        {
            await _userService.ApproveTutorAsync(userId, cancellationToken);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
