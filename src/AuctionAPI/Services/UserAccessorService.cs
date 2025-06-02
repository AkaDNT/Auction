using System.Security.Claims;
using AuctionAPI.Identity;
using AuctionAPI.Infrastructure;
using AuctionAPI.ServiceContracts;

namespace AuctionAPI.Services;

public class UserAccessorService(AuctionDbContext dbContext)
    : IUserAccessorService
{
    public async Task<ApplicationUser> GetApplicationUserAsync(Guid userId)
    {
        return await dbContext.Users.FindAsync(userId)
            ?? throw new UnauthorizedAccessException("No user is logged in");
    }
}