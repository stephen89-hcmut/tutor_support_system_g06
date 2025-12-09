using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TutorSupportSystem.Application.DTOs;

namespace TutorSupportSystem.Application.Interfaces;

public interface IAiMatchingService
{
    Task<IReadOnlyList<TutorMatchResult>> SuggestTutorsAsync(Guid studentId, CancellationToken cancellationToken = default);
}
