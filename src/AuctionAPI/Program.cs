using AuctionAPI.Identity;
using AuctionAPI.Infrastructure;
using AuctionAPI.Repositories;
using AuctionAPI.ServiceContracts;
using AuctionAPI.Services;
using AuctionAPI.SignalR;
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
builder.Services.AddScoped<IUserAccessorService, UserAccessorService>();

// builder.Services.AddHttpContextAccessor();

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

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Add AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// Add SignalR
builder.Services.AddSignalR();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseCors("CorsPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapGroup("api").MapIdentityApi<ApplicationUser>();
app.MapControllers();
app.MapHub<BidHub>("/bids");

app.Run();
