
using AuctionAPI.Identity;

namespace AuctionAPI.ServiceContracts
{
    public interface IUserAccessorService
    {
        Task<ApplicationUser> GetApplicationUserAsync();
        string GetApplicationUserId();
    }
}