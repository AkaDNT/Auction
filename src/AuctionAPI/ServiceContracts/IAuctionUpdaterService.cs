using AuctionAPI.DTOs;

namespace AuctionAPI.ServiceContracts
{
    public interface IAuctionUpdaterService
    {
        Task<AuctionResponse> UpdateAuction(Guid ID, AuctionUpdateRequest auctionUpdateRequest);
    }
}