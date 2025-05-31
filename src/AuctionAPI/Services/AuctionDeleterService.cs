
using AuctionAPI.Repositories;
using AuctionAPI.ServiceContracts;

namespace AuctionAPI.Services
{
    public class AuctionDeleterService : IAuctionDeleterService
    {
        private readonly IAuctionRepository _repo;

        public AuctionDeleterService(IAuctionRepository repo)
        {
            _repo = repo;
        }

        public async Task<int> DeleteAuction(Guid ID, string sellerEmail)
        {
            var auction = await _repo.GetAuctionByID(ID);
            if (!auction.Seller.Equals(sellerEmail)) return -1;
            return await _repo.DeleteAuction(ID);
        }
    }
}