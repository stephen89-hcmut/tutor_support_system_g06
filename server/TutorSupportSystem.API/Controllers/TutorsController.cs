using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TutorSupportSystem.Application.Interfaces;
using TutorSupportSystem.Domain.Enums;
using TutorSupportSystem.Domain.Repositories;
using TutorSupportSystem.Infrastructure.Database;

namespace TutorSupportSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TutorsController : ControllerBase
{
    private readonly IAiMatchingService _aiMatchingService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly AppDbContext _dbContext;

    public TutorsController(IAiMatchingService aiMatchingService, IUnitOfWork unitOfWork, AppDbContext dbContext)
    {
        _aiMatchingService = aiMatchingService;
        _unitOfWork = unitOfWork;
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetTutors([FromQuery] string? search, [FromQuery] string? subject, CancellationToken cancellationToken)
    {
        var query = _dbContext.TutorProfiles
            .AsNoTracking()
            .Include(t => t.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(t => t.User.FullName.ToLower().Contains(term) || t.TutorCode.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(subject))
        {
            var term = subject.Trim().ToLower();
            query = query.Where(t => (t.Expertise ?? string.Empty).ToLower().Contains(term));
        }

        var tutors = await query
            .OrderByDescending(t => t.AverageRating)
            .ThenBy(t => t.User.FullName)
            .Select(t => new
            {
                t.Id,
                t.UserId,
                FullName = t.User.FullName,
                t.TutorCode,
                t.AverageRating,
                t.TotalReviews,
                t.Expertise,
                t.Bio
            })
            .ToListAsync(cancellationToken);

        return Ok(tutors);
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
