using AuctionAPI.Identity;
using AuctionAPI.Infrastructure;
using AuctionAPI.Repositories;
using AuctionAPI.ServiceContracts;
using AuctionAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers(opt =>
{
    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
    opt.Filters.Add(new AuthorizeFilter(policy));
});


builder.Services.AddScoped<IAuctionRepository, AuctionRepository>();
builder.Services.AddScoped<IAuctionGetterService, AuctionGetterService>();
builder.Services.AddScoped<IAuctionAdderService, AuctionAdderService>();
builder.Services.AddScoped<IAuctionUpdaterService, AuctionUpdaterService>();
builder.Services.AddScoped<IAuctionDeleterService, AuctionDeleterService>();
builder.Services.AddScoped<ISearchService, SearchService>();

// Add DbContext
builder.Services.AddDbContext<AuctionDbContext>(opt =>
{
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddIdentityApiEndpoints<ApplicationUser>(opt =>
{
    opt.User.RequireUniqueEmail = true;
}).AddRoles<ApplicationRole>().AddEntityFrameworkStores<AuctionDbContext>();

builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
});


// Add AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseAuthentication();
app.UseAuthorization();
app.MapGroup("api").MapIdentityApi<ApplicationUser>();
app.MapControllers();

app.Run();
