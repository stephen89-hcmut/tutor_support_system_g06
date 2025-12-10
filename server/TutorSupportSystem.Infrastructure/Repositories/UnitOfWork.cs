using System.Threading;
using System.Threading.Tasks;
using TutorSupportSystem.Domain.Entities;
using TutorSupportSystem.Domain.Repositories;
using TutorSupportSystem.Infrastructure.Database;

namespace TutorSupportSystem.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
        Users = new GenericRepository<User>(_context);
        Meetings = new GenericRepository<Meeting>(_context);
        Feedbacks = new GenericRepository<Feedback>(_context);
        StudentProfiles = new GenericRepository<StudentProfile>(_context);
        TutorProfiles = new GenericRepository<TutorProfile>(_context);
        Participants = new GenericRepository<Participant>(_context);
        ProgressRecords = new GenericRepository<ProgressRecord>(_context);
        RefreshTokens = new GenericRepository<RefreshToken>(_context);
    }

    public IGenericRepository<User> Users { get; }
    public IGenericRepository<Meeting> Meetings { get; }
    public IGenericRepository<Feedback> Feedbacks { get; }
    public IGenericRepository<StudentProfile> StudentProfiles { get; }
    public IGenericRepository<TutorProfile> TutorProfiles { get; }
    public IGenericRepository<Participant> Participants { get; }
    public IGenericRepository<ProgressRecord> ProgressRecords { get; }
    public IGenericRepository<RefreshToken> RefreshTokens { get; }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }

    public ValueTask DisposeAsync()
    {
        return _context.DisposeAsync();
    }
}
