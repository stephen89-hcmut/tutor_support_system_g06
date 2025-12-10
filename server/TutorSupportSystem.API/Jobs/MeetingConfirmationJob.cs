using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TutorSupportSystem.Domain.Enums;
using TutorSupportSystem.Domain.Repositories;

namespace TutorSupportSystem.API.Jobs;

public class MeetingConfirmationJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MeetingConfirmationJob> _logger;

    public MeetingConfirmationJob(IServiceProvider serviceProvider, ILogger<MeetingConfirmationJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("MeetingConfirmationJob started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RunOnceAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                // graceful shutdown
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "MeetingConfirmationJob failed while processing meetings");
            }

            try
            {
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }

        _logger.LogInformation("MeetingConfirmationJob stopped");
    }

    private async Task RunOnceAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var now = DateTime.UtcNow;
        var windowEnd = now.AddHours(24);

        var meetings = await unitOfWork.Meetings.FindAsync(
            m => (m.Status == MeetingStatus.Open || m.Status == MeetingStatus.Full)
                 && m.StartTime >= now
                 && m.StartTime <= windowEnd,
            cancellationToken);

        if (meetings.Count == 0)
        {
            return;
        }

        foreach (var meeting in meetings)
        {
            if (meeting.CurrentCount >= 6)
            {
                meeting.Status = MeetingStatus.Confirmed;
            }
            else
            {
                meeting.Status = MeetingStatus.CancelledBySystem;
            }

            unitOfWork.Meetings.Update(meeting);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("MeetingConfirmationJob processed {Count} meetings in window ending at {WindowEnd}", meetings.Count, windowEnd);
    }
}
