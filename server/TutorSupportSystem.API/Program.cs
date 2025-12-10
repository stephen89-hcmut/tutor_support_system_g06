using Microsoft.AspNetCore.HttpLogging;
using Microsoft.EntityFrameworkCore;
using TutorSupportSystem.Application.Interfaces;
using TutorSupportSystem.Application.Services;
using TutorSupportSystem.Domain.Repositories;
using TutorSupportSystem.Infrastructure.Database;
using TutorSupportSystem.Infrastructure.Data;
using TutorSupportSystem.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddSimpleConsole(options =>
{
    options.TimestampFormat = "yyyy-MM-dd HH:mm:ss ";
    options.UseUtcTimestamp = true;
});
builder.Logging.SetMinimumLevel(LogLevel.Information);

builder.Services.AddHttpLogging(options =>
{
    options.LoggingFields = HttpLoggingFields.All;
    options.RequestBodyLogLimit = 4096;
    options.ResponseBodyLogLimit = 4096;
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options
        .UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
        .EnableSensitiveDataLogging()
        .EnableDetailedErrors()
        .LogTo(Console.WriteLine, new[]
        {
            DbLoggerCategory.Database.Command.Name,
            DbLoggerCategory.Migrations.Name
        }, LogLevel.Information));

// DI registrations
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IMeetingService, MeetingService>();
builder.Services.AddScoped<IAiMatchingService, AiMatchingService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.Migrate();
    DbInitializer.Initialize(context);
}

// Always expose Swagger UI to make manual testing easy during development/runs
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpLogging();
app.UseAuthorization();

app.MapControllers();

app.Run();
