using Microsoft.EntityFrameworkCore;
using TutorSupportSystem.Application.Interfaces;
using TutorSupportSystem.Application.Services;
using TutorSupportSystem.Domain.Repositories;
using TutorSupportSystem.Infrastructure.Database;
using TutorSupportSystem.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// DI registrations
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IMeetingService, MeetingService>();
builder.Services.AddScoped<IAiMatchingService, AiMatchingService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
