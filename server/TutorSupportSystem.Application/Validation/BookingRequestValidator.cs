using FluentValidation;
using TutorSupportSystem.Application.DTOs;

namespace TutorSupportSystem.Application.Validation;

public class BookingRequestValidator : AbstractValidator<BookingRequest>
{
    public BookingRequestValidator()
    {
        RuleFor(x => x.MeetingId).NotEmpty();
        RuleFor(x => x.StudentId).NotEmpty();
    }
}
