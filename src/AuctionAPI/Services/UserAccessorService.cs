
using System.Data.Entity;
using System.Security.Claims;
using AuctionAPI.Identity;
using AuctionAPI.Infrastructure;
using AuctionAPI.ServiceContracts;

namespace AuctionAPI.Services
{
    public class UserAccessorService : IUserAccessorService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly AuctionDbContext _dbConxtext;

        public UserAccessorService(IHttpContextAccessor httpContextAccessor, AuctionDbContext dbConxtext)
        {
            _httpContextAccessor = httpContextAccessor;
            _dbConxtext = dbConxtext;
        }

        public async Task<ApplicationUser> GetApplicationUserAsync()
        {
            return await _dbConxtext.Users.FindAsync(GetApplicationUserId()) ??
            throw new UnauthorizedAccessException("No user is logged in");
        }

        public string GetApplicationUserId()
        {
            return _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            throw new Exception("Not found");
        }
    }
}