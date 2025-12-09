using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TutorSupportSystem.Application.DTOs;
using TutorSupportSystem.Application.Interfaces;
using TutorSupportSystem.Domain.Enums;
using TutorSupportSystem.Infrastructure.Database;

namespace TutorSupportSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MeetingsController : ControllerBase
{
    private readonly IMeetingService _meetingService;
    private readonly AppDbContext _dbContext;

    public MeetingsController(IMeetingService meetingService, AppDbContext dbContext)
    {
        _meetingService = meetingService;
        _dbContext = dbContext;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMeetingRequest request, CancellationToken cancellationToken)
    {
        var created = await _meetingService.CreateMeetingAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPost("{id:guid}/book")]
    public async Task<IActionResult> Book(Guid id, [FromBody] BookingRequest request, CancellationToken cancellationToken)
    {
        if (id != request.MeetingId)
        {
            return BadRequest("Meeting id mismatch.");
        }

        var success = await _meetingService.BookMeetingAsync(request, cancellationToken);
        return success ? Ok() : BadRequest("Unable to book meeting (conflict or capacity reached).");
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] Guid? tutorId, [FromQuery] DateTime? start, [FromQuery] DateTime? end, [FromQuery] MeetingStatus? status, CancellationToken cancellationToken)
    {
        var query = _dbContext.Meetings.AsQueryable();

        if (tutorId.HasValue)
        {
            query = query.Where(m => m.TutorId == tutorId.Value);
        }

        if (start.HasValue)
        {
            query = query.Where(m => m.StartTime >= start.Value);
        }

        if (end.HasValue)
        {
            query = query.Where(m => m.EndTime <= end.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(m => m.Status == status.Value);
        }

        var results = await query.OrderBy(m => m.StartTime).ToListAsync(cancellationToken);
        var dtos = results.Select(m => new MeetingDto(
            m.Id,
            m.Title,
            m.StartTime,
            m.EndTime,
            m.Mode,
            m.TutorId,
            m.MinCapacity,
            m.MaxCapacity,
            m.CurrentCount,
            m.Status
        ));

        return Ok(dtos);
    }
}
