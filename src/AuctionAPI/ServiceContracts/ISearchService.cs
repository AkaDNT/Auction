

using AuctionAPI.DTOs;

namespace AuctionAPI.ServiceContracts
{
    public interface ISearchService
    {
        public List<AuctionResponse> SearchAllAuctions(string searchTerm, int filter);
        public List<AuctionResponse> SearchAllMyAuctions(string email, string searchTerm, int filter);
        public Task<List<AuctionResponse>> Search(string searchTerm, int pageNumber, int pageSize, int sort, int filter);
        public Task<List<AuctionResponse>> GetMyAuctions(string sellerEmail, string searchTerm, int pageNumber, int pageSize, int sort, int filter);
    }
}