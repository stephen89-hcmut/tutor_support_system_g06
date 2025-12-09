using System;
using Microsoft.AspNetCore.Mvc;
using TutorSupportSystem.API.Contracts;
using TutorSupportSystem.Domain.Entities;
using TutorSupportSystem.Domain.Repositories;

namespace TutorSupportSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProgressController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public ProgressController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProgressRequest request, CancellationToken cancellationToken)
    {
        var meeting = await _unitOfWork.Meetings.GetByIdAsync(request.MeetingId, cancellationToken);
        if (meeting is null)
        {
            return NotFound("Meeting not found");
        }

        var student = await _unitOfWork.StudentProfiles.GetByIdAsync(request.StudentId, cancellationToken);
        if (student is null)
        {
            return NotFound("Student not found");
        }

        var record = new ProgressRecord
        {
            MeetingId = request.MeetingId,
            StudentId = request.StudentId,
            Understanding = request.Understanding,
            ProblemSolving = request.ProblemSolving,
            CodeQuality = request.CodeQuality,
            Participation = request.Participation,
            OverallScore = (request.Understanding + request.ProblemSolving + request.CodeQuality + request.Participation) / 4.0,
            TutorComments = request.TutorComments,
            PrivateNote = request.PrivateNote,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.ProgressRecords.AddAsync(record, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(Create), new { id = record.Id }, record);
    }
}
