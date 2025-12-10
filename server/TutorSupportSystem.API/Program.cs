using Microsoft.AspNetCore.HttpLogging;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TutorSupportSystem.API.Jobs;
using TutorSupportSystem.API.Auth;
using TutorSupportSystem.Application.Interfaces;
using TutorSupportSystem.Application.Services;
using TutorSupportSystem.Domain.Interfaces;
using TutorSupportSystem.Domain.Repositories;
using TutorSupportSystem.Infrastructure.Auth;
using TutorSupportSystem.Infrastructure.Data;
using TutorSupportSystem.Infrastructure.Database;
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
builder.Services.AddHttpContextAccessor();
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();
var keyBytes = Encoding.UTF8.GetBytes(jwtSettings.Key);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
    };
});

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
builder.Services.AddScoped<IUserContext, HttpUserContext>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddSingleton<ITokenService, TokenService>();
builder.Services.AddScoped<IRefreshTokenStore, EfRefreshTokenStore>();
builder.Services.AddHostedService<MeetingConfirmationJob>();

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
