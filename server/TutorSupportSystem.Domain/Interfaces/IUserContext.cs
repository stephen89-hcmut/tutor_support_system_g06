using System;

namespace TutorSupportSystem.Domain.Interfaces;

public interface IUserContext
{
    Guid GetCurrentUserId();
}
