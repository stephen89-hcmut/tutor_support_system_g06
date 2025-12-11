using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorSupportSystem.Application.DTOs;
using TutorSupportSystem.Application.Interfaces;
using TutorSupportSystem.Domain.Enums;

namespace TutorSupportSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MeetingsController : ControllerBase
{
    private readonly IMeetingService _meetingService;

    public MeetingsController(IMeetingService meetingService)
    {
        _meetingService = meetingService;
    }

    [HttpPost]
    [Authorize(Roles = "Tutor")]
    public async Task<IActionResult> Create([FromBody] CreateMeetingRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await _meetingService.CreateSlotAsync(request, cancellationToken);
            return CreatedAtAction(nameof(Create), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id:guid}/join")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> Join(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await _meetingService.JoinMeetingAsync(id, cancellationToken);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    public class CancelBody
    {
        public string Reason { get; set; } = string.Empty;
    }

    [HttpPost("{id:guid}/cancel")]
    [Authorize(Roles = "Student,Tutor")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelBody body, CancellationToken cancellationToken)
    {
        if (!User.IsInRole("Student") && !User.IsInRole("Tutor"))
        {
            return Forbid();
        }

        try
        {
            await _meetingService.CancelMeetingAsync(id, body.Reason, cancellationToken);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPatch("{id:guid}/start")]
    [Authorize(Roles = "Tutor")]
    public async Task<IActionResult> Start(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await _meetingService.StartMeetingAsync(id, cancellationToken);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPatch("{id:guid}/finish")]
    [Authorize(Roles = "Tutor")]
    public async Task<IActionResult> Finish(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await _meetingService.FinishMeetingAsync(id, cancellationToken);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{id:guid}/attendance")]
    [Authorize(Roles = "Tutor")]
    public async Task<IActionResult> SubmitAttendance(Guid id, [FromBody] List<AttendanceEntry> entries, CancellationToken cancellationToken)
    {
        try
        {
            await _meetingService.SubmitAttendanceAsync(id, entries, cancellationToken);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetMyMeetings(CancellationToken cancellationToken)
    {
        try
        {
            var meetings = await _meetingService.GetMyMeetingsAsync(cancellationToken);
            return Ok(meetings);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var meeting = await _meetingService.GetMeetingByIdAsync(id, cancellationToken);
            return Ok(meeting);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("tutor/{tutorId}/students")]
    [Authorize(Roles = "Tutor,Manager")]
    public async Task<IActionResult> GetTutorStudents(string tutorId, CancellationToken cancellationToken)
    {
        try
        {
            var meetings = await _meetingService.GetTutorStudentsAsync(tutorId, cancellationToken);
            return Ok(meetings);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
