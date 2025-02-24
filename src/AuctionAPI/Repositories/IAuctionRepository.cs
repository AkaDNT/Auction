using AuctionAPI.Entities;

namespace AuctionAPI.Repositories
{
    public interface IAuctionRepository
    {
        Task<List<Auction>> GetAllAuctions();
        Task<Auction> GetAuctionByID(Guid Id);
        Task<Auction> CreateNewAuction(Auction auction);
    }
}