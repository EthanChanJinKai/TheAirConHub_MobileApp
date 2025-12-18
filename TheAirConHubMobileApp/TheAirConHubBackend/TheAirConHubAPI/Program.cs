using Microsoft.EntityFrameworkCore;
using TheAirConHubAPI.Models; // Ensure this matches the namespace in your Models folder

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. REGISTER DATABASE
// ==========================================
// This connects your C# code to the SQL Server you installed
builder.Services.AddDbContext<TheAirConHubDbContext>(options =>
    options.UseSqlServer("Server=localhost;Database=TheAirConHubDB;Trusted_Connection=True;TrustServerCertificate=True;"));

// ==========================================
// 2. ENABLE CORS (Crucial for Mobile Apps)
// ==========================================
// This allows your React Native app (running on a different 'server' aka your phone)
// to send requests to this API without getting blocked.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

// ==========================================
// 3. ACTIVATE CORS
// ==========================================
// Must be placed BEFORE UseAuthorization
app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();