using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TutorSupportSystem.Infrastructure.Database;

namespace TutorSupportSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubjectsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public SubjectsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var subjects = await _dbContext.Subjects
            .AsNoTracking()
            .OrderBy(s => s.Code)
            .Select(s => new { s.Id, s.Code, s.Name, s.Type })
            .ToListAsync(cancellationToken);

        return Ok(subjects);
    }
}
