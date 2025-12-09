using System;
using Microsoft.AspNetCore.Mvc;
using TutorSupportSystem.Application.Interfaces;

namespace TutorSupportSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TutorsController : ControllerBase
{
    private readonly IAiMatchingService _aiMatchingService;

    public TutorsController(IAiMatchingService aiMatchingService)
    {
        _aiMatchingService = aiMatchingService;
    }

    [HttpGet("suggestion")]
    public async Task<IActionResult> Suggestion([FromQuery] Guid studentId, CancellationToken cancellationToken)
    {
        if (studentId == Guid.Empty)
        {
            return BadRequest("studentId is required");
        }

        var results = await _aiMatchingService.SuggestTutorsAsync(studentId, cancellationToken);
        return Ok(results);
    }
}
