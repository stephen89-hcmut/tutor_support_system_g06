using FluentValidation;
using TutorSupportSystem.Application.DTOs;

namespace TutorSupportSystem.Application.Validation;

public class CreateMeetingRequestValidator : AbstractValidator<CreateMeetingRequest>
{
    public CreateMeetingRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.StartTime).LessThan(x => x.EndTime);
        RuleFor(x => x.MinCapacity).GreaterThanOrEqualTo(1);
        RuleFor(x => x.MaxCapacity).GreaterThanOrEqualTo(x => x.MinCapacity);
    }
}
