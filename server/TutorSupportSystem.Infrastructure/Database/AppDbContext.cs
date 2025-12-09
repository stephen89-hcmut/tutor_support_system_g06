using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using TutorSupportSystem.Domain.Entities;

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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var stringCollectionConverter = new ValueConverter<ICollection<string>, string>(
            v => string.Join(';', v),
            v => string.IsNullOrWhiteSpace(v)
                ? new List<string>()
                : v.Split(';', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList()
        );

        var stringCollectionComparer = new ValueComparer<ICollection<string>>(
            (c1, c2) => (c1 ?? Array.Empty<string>()).SequenceEqual(c2 ?? Array.Empty<string>()),
            c => (c ?? Array.Empty<string>()).Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => (c ?? Array.Empty<string>()).ToList()
        );

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasOne(u => u.StudentProfile)
                .WithOne(s => s.User)
                .HasForeignKey<StudentProfile>(s => s.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(u => u.TutorProfile)
                .WithOne(t => t.User)
                .HasForeignKey<TutorProfile>(t => t.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<StudentProfile>(entity =>
        {
            entity.Property(s => s.WeakSubjects)
                .HasConversion(stringCollectionConverter)
                .Metadata.SetValueComparer(stringCollectionComparer);
        });

        modelBuilder.Entity<TutorProfile>(entity =>
        {
            entity.Property(t => t.Expertise)
                .HasConversion(stringCollectionConverter)
                .Metadata.SetValueComparer(stringCollectionComparer);
        });

        modelBuilder.Entity<Meeting>(entity =>
        {
            entity.HasOne(m => m.Tutor)
                .WithMany(u => u.TutorMeetings)
                .HasForeignKey(m => m.TutorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Participant>(entity =>
        {
            entity.HasOne(p => p.Meeting)
                .WithMany(m => m.Participants)
                .HasForeignKey(p => p.MeetingId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(p => p.Student)
                .WithMany(s => s.Participations)
                .HasForeignKey(p => p.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ProgressRecord>(entity =>
        {
            entity.HasOne(p => p.Meeting)
                .WithMany(m => m.ProgressRecords)
                .HasForeignKey(p => p.MeetingId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(p => p.Student)
                .WithMany(s => s.ProgressRecords)
                .HasForeignKey(p => p.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasOne(f => f.Meeting)
                .WithMany(m => m.Feedbacks)
                .HasForeignKey(f => f.MeetingId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(f => f.Student)
                .WithMany(s => s.Feedbacks)
                .HasForeignKey(f => f.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
