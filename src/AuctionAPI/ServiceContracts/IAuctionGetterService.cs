using AuctionAPI.DTOs;

namespace AuctionAPI.ServiceContracts
{
    public interface IAuctionGetterService
    {
        Task<List<AuctionResponse>> GetAllAuctions();
        Task<AuctionResponse> GetAuctionByID(Guid ID);
    }
}