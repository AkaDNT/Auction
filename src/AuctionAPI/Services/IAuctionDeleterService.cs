

namespace AuctionAPI.Services
{
    public interface IAuctionDeleterService
    {
        Task<int> DeleteAuction(Guid ID);
    }
}