using Microsoft.EntityFrameworkCore;
using TutorSupportSystem.Domain.Entities;
using TutorSupportSystem.Domain.Enums;

namespace TutorSupportSystem.Infrastructure.Database;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<TutorProfile> TutorProfiles => Set<TutorProfile>();
    public DbSet<Meeting> Meetings => Set<Meeting>();
    public DbSet<Participant> Participants => Set<Participant>();
    public DbSet<Feedback> Feedbacks => Set<Feedback>();
    public DbSet<ProgressRecord> ProgressRecords => Set<ProgressRecord>();
    public DbSet<Material> Materials => Set<Material>();
    public DbSet<TutorSuggestion> TutorSuggestions => Set<TutorSuggestion>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Faculty> Faculties => Set<Faculty>();
    public DbSet<Subject> Subjects => Set<Subject>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(u => u.SsoId).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(255);
            entity.Property(u => u.FullName).IsRequired().HasMaxLength(200);
            entity.Property(u => u.AvatarUrl).HasMaxLength(500);
            entity.Property(u => u.PhoneNumber).HasMaxLength(20);

            entity.HasOne(u => u.StudentProfile)
                .WithOne(s => s.User)
                .HasForeignKey<StudentProfile>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(u => u.TutorProfile)
                .WithOne(t => t.User)
                .HasForeignKey<TutorProfile>(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<StudentProfile>(entity =>
        {
            entity.Property(s => s.StudentCode).IsRequired().HasMaxLength(50);
            entity.Property(s => s.Major).HasMaxLength(200);
            entity.Property(s => s.WeakSubjects).HasMaxLength(500);
            entity.Property(s => s.LearningStyles).HasMaxLength(500);
            entity.HasAlternateKey(s => s.UserId);
            entity.HasIndex(s => s.UserId).IsUnique();

            entity.HasOne(s => s.Faculty)
                .WithMany(f => f.Students)
                .HasForeignKey(s => s.FacultyId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TutorProfile>(entity =>
        {
            entity.Property(t => t.TutorCode).IsRequired().HasMaxLength(50);
            entity.Property(t => t.Bio).HasMaxLength(2000);
            entity.Property(t => t.Expertise).HasMaxLength(500);
            entity.Property(t => t.TeachingMethod).HasMaxLength(500);
            entity.Property(t => t.CertificatesUrl).HasMaxLength(500);
            entity.HasAlternateKey(t => t.UserId);
            entity.HasIndex(t => t.UserId).IsUnique();
        });

        modelBuilder.Entity<Meeting>(entity =>
        {
            entity.Property(m => m.Title).IsRequired().HasMaxLength(200);
            entity.Property(m => m.Description).HasMaxLength(2000);
            entity.Property(m => m.Mode).IsRequired();
            entity.Property(m => m.StartTime).IsRequired();
            entity.Property(m => m.EndTime).IsRequired();
            entity.Property(m => m.MinCapacity).IsRequired();
            entity.Property(m => m.MaxCapacity).IsRequired();
            entity.Property(m => m.Location).HasMaxLength(500);

            entity.HasOne(m => m.Tutor)
                .WithMany(u => u.TutorMeetings)
                .HasForeignKey(m => m.TutorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Participant>(entity =>
        {
            entity.Property(p => p.Note).HasMaxLength(1000);

            entity.HasOne(p => p.Meeting)
                .WithMany(m => m.Participants)
                .HasForeignKey(p => p.MeetingId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(p => p.Student)
                .WithMany(u => u.Participations)
                .HasForeignKey(p => p.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(p => new { p.MeetingId, p.StudentId }).IsUnique();
        });

        modelBuilder.Entity<ProgressRecord>(entity =>
        {
            entity.Property(p => p.Understanding).IsRequired();
            entity.Property(p => p.ProblemSolving).IsRequired();
            entity.Property(p => p.CodeQuality).IsRequired();
            entity.Property(p => p.Participation).IsRequired();
            entity.Property(p => p.TutorComments).HasMaxLength(2000);
            entity.Property(p => p.PrivateNote).HasMaxLength(2000);

            entity.HasOne(p => p.Meeting)
                .WithMany(m => m.ProgressRecords)
                .HasForeignKey(p => p.MeetingId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.Student)
                .WithMany(s => s.ProgressRecords)
                .HasForeignKey(p => p.StudentId)
                .HasPrincipalKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.Property(f => f.Comment).IsRequired().HasMaxLength(2000);
            entity.Property(f => f.TutorReply).HasMaxLength(2000);

            entity.HasOne(f => f.Meeting)
                .WithMany(m => m.Feedbacks)
                .HasForeignKey(f => f.MeetingId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(f => f.Student)
                .WithMany(s => s.Feedbacks)
                .HasForeignKey(f => f.StudentId)
                .HasPrincipalKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(f => f.Tutor)
                .WithMany(t => t.Feedbacks)
                .HasForeignKey(f => f.TutorId)
                .HasPrincipalKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Material>(entity =>
        {
            entity.Property(m => m.Title).IsRequired().HasMaxLength(255);
            entity.Property(m => m.FileUrl).HasMaxLength(500);
            entity.Property(m => m.LibraryResourceId).HasMaxLength(200);

            entity.HasOne(m => m.Uploader)
                .WithMany()
                .HasForeignKey(m => m.UploadedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TutorSuggestion>(entity =>
        {
            entity.Property(t => t.MatchingReason).HasMaxLength(1000);

            entity.HasOne(ts => ts.Tutor)
                .WithMany()
                .HasForeignKey(ts => ts.TutorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.Property(n => n.Title).IsRequired().HasMaxLength(255);
            entity.Property(n => n.Message).IsRequired().HasMaxLength(2000);
            entity.Property(n => n.Type).HasMaxLength(50);

            entity.HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Faculty>(entity =>
        {
            entity.Property(f => f.Code).IsRequired().HasMaxLength(10);
            entity.Property(f => f.Name).IsRequired().HasMaxLength(200);
            entity.HasIndex(f => f.Code).IsUnique();
        });

        modelBuilder.Entity<Subject>(entity =>
        {
            entity.Property(s => s.Code).IsRequired().HasMaxLength(20);
            entity.Property(s => s.Name).IsRequired().HasMaxLength(255);

            entity.HasOne(s => s.Faculty)
                .WithMany(f => f.Subjects)
                .HasForeignKey(s => s.FacultyId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
