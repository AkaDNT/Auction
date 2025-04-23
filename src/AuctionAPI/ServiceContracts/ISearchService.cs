

using AuctionAPI.DTOs;

namespace AuctionAPI.ServiceContracts
{
    public interface ISearchService
    {
        public List<AuctionResponse> SearchAllAuctions(string searchTerm, int sort);
        public Task<List<AuctionResponse>> Search(string searchTerm, int pageNumber, int pageSize, int sort);
    }
}