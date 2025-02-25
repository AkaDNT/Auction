using AuctionAPI.Infrastructure;
using AuctionAPI.Repositories;
using AuctionAPI.ServiceContracts;
using AuctionAPI.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddScoped<IAuctionRepository, AuctionRepository>();
builder.Services.AddScoped<IAuctionGetterService, AuctionGetterService>();
builder.Services.AddScoped<IAuctionAdderService, AuctionAdderService>();
builder.Services.AddScoped<IAuctionUpdaterService, AuctionUpdaterService>();
builder.Services.AddScoped<IAuctionDeleterService, AuctionDeleterService>();

// Add DbContext
builder.Services.AddDbContext<AuctionDbContext>(opt =>
{
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Add AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseAuthorization();

app.MapControllers();

app.Run();
