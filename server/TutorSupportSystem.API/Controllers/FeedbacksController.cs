using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorSupportSystem.Domain.Entities;
using TutorSupportSystem.Domain.Enums;
using TutorSupportSystem.Domain.Interfaces;
using TutorSupportSystem.Domain.Repositories;

namespace TutorSupportSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeedbacksController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;

    public FeedbacksController(IUnitOfWork unitOfWork, IUserContext userContext)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
    }

    public class CreateFeedbackRequest
    {
        public Guid MeetingId { get; set; }
        public Guid TutorId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }

    [HttpPost]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> Create([FromBody] CreateFeedbackRequest request, CancellationToken cancellationToken)
    {
        if (request.Rating < 1 || request.Rating > 5)
        {
            return BadRequest("Rating must be between 1 and 5.");
        }

        var studentId = _userContext.GetCurrentUserId();

        var meeting = await _unitOfWork.Meetings.GetByIdAsync(request.MeetingId, cancellationToken);
        if (meeting is null)
        {
            return NotFound("Meeting not found.");
        }

        if (meeting.TutorId != request.TutorId)
        {
            return BadRequest("Tutor does not match the meeting.");
        }

        var tutorProfiles = await _unitOfWork.TutorProfiles.FindAsync(t => t.UserId == request.TutorId, cancellationToken);
        var tutor = tutorProfiles.FirstOrDefault();
        if (tutor is null)
        {
            return NotFound("Tutor profile not found.");
        }

        var feedback = new Feedback
        {
            Id = Guid.NewGuid(),
            MeetingId = request.MeetingId,
            StudentId = studentId,
            TutorId = request.TutorId,
            Rating = request.Rating,
            Comment = request.Comment ?? string.Empty,
            Sentiment = SentimentType.Neutral
        };

        await _unitOfWork.Feedbacks.AddAsync(feedback, cancellationToken);

        // Update tutor aggregates
        var totalBefore = tutor.TotalReviews;
        var avgBefore = tutor.AverageRating;
        var newTotal = totalBefore + 1;
        var newAvg = Math.Round(((avgBefore * totalBefore) + request.Rating) / newTotal, 1);
        tutor.TotalReviews = newTotal;
        tutor.AverageRating = newAvg;
        _unitOfWork.TutorProfiles.Update(tutor);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Ok(new { feedback.Id, tutor.AverageRating, tutor.TotalReviews });
    }
}
