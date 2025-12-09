using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TutorSupportSystem.Application.DTOs;
using TutorSupportSystem.Application.Interfaces;
using TutorSupportSystem.Infrastructure.Database;

namespace TutorSupportSystem.Application.Services;

public class AiMatchingService : IAiMatchingService
{
    private readonly AppDbContext _dbContext;

    public AiMatchingService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<TutorMatchResult>> SuggestTutorsAsync(Guid studentId, CancellationToken cancellationToken = default)
    {
        var student = await _dbContext.StudentProfiles
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == studentId, cancellationToken);

        if (student is null)
        {
            return Array.Empty<TutorMatchResult>();
        }

        var tutors = await _dbContext.TutorProfiles
            .Include(t => t.User)
            .ToListAsync(cancellationToken);

        var weakSubjects = student.WeakSubjects ?? Array.Empty<string>();

        var results = tutors.Select(tutor =>
        {
            var expertise = tutor.Expertise ?? Array.Empty<string>();
            var matchCount = weakSubjects.Count(ws => expertise.Contains(ws, StringComparer.OrdinalIgnoreCase));
            var subjectMatchScore = weakSubjects.Count == 0 ? 0 : (double)matchCount / weakSubjects.Count;
            var ratingScore = Math.Clamp(tutor.AverageRating / 5.0, 0, 1);

            // Weight: subjects 40%, rating 20% (scaled to 100%).
            var raw = (subjectMatchScore * 0.4) + (ratingScore * 0.2);
            var matchPercentage = Math.Round(raw / 0.6 * 100, 2);

            return new TutorMatchResult(
                tutor.Id,
                tutor.UserId,
                tutor.TutorCode,
                tutor.User?.FullName ?? "Unknown",
                tutor.AverageRating,
                matchPercentage,
                expertise.ToList()
            );
        })
        .OrderByDescending(r => r.MatchPercentage)
        .ToList();

        return results;
    }
}
