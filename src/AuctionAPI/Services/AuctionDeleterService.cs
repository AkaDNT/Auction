
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

        public async Task<int> DeleteAuction(Guid ID)
        {
            return await _repo.DeleteAuction(ID);
        }
    }
}