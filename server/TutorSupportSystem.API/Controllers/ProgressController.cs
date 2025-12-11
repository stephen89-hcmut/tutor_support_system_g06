using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TutorSupportSystem.API.Contracts;
using TutorSupportSystem.Domain.Entities;
using TutorSupportSystem.Domain.Enums;
using TutorSupportSystem.Domain.Repositories;
using TutorSupportSystem.Infrastructure.Database;

namespace TutorSupportSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProgressController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly AppDbContext _dbContext;

    [ActivatorUtilitiesConstructor]
    public ProgressController(IUnitOfWork unitOfWork, AppDbContext dbContext)
    {
        _unitOfWork = unitOfWork;
        _dbContext = dbContext;
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

    [HttpGet("student/{studentId}")]
    public async Task<IActionResult> GetByStudent(Guid studentId, CancellationToken cancellationToken)
    {
        var records = await _dbContext.ProgressRecords
            .Include(p => p.Meeting)!.ThenInclude(m => m.Tutor)
            .Where(p => p.StudentId == studentId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);

        var meetingIds = records.Select(r => r.MeetingId).Distinct().ToList();

        var participantStatuses = await _dbContext.Participants
            .Where(p => p.StudentId == studentId && meetingIds.Contains(p.MeetingId))
            .ToListAsync(cancellationToken);

        var feedbacks = await _dbContext.Feedbacks
            .Where(f => f.StudentId == studentId && meetingIds.Contains(f.MeetingId))
            .ToListAsync(cancellationToken);

        var response = records.Select(r =>
        {
            var meeting = r.Meeting;
            var attendance = participantStatuses
                .FirstOrDefault(p => p.MeetingId == r.MeetingId)?.Status switch
            {
                ParticipantStatus.Present => "Present",
                ParticipantStatus.Absent => "Absent",
                _ => "Absent"
            };

            var isRated = feedbacks.Any(f => f.MeetingId == r.MeetingId && f.StudentId == studentId);

            return new ProgressResponse(
                r.Id,
                r.MeetingId,
                meeting?.StartTime ?? DateTime.MinValue,
                meeting?.Title ?? "Session",
                meeting?.Tutor?.FullName ?? "Tutor",
                meeting?.Tutor?.AvatarUrl,
                attendance,
                r.Understanding,
                r.ProblemSolving,
                r.Participation,
                r.TutorComments ?? string.Empty,
                !string.IsNullOrWhiteSpace(meeting?.Description),
                isRated
            );
        }).ToList();

        return Ok(response);
    }
}
