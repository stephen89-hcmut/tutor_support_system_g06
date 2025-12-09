using System.Threading;
using System.Threading.Tasks;
using TutorSupportSystem.Domain.Entities;

namespace TutorSupportSystem.Domain.Repositories;

public interface IUnitOfWork : IAsyncDisposable
{
    IGenericRepository<User> Users { get; }
    IGenericRepository<Meeting> Meetings { get; }
    IGenericRepository<Feedback> Feedbacks { get; }
    IGenericRepository<StudentProfile> StudentProfiles { get; }
    IGenericRepository<TutorProfile> TutorProfiles { get; }
    IGenericRepository<Participant> Participants { get; }
    IGenericRepository<ProgressRecord> ProgressRecords { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
