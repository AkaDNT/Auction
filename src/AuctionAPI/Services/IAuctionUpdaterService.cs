using AuctionAPI.DTOs;

namespace AuctionAPI.Services
{
    public interface IAuctionUpdaterService
    {
        Task<AuctionResponse> UpdateAuction(Guid ID, AuctionUpdateRequest auctionUpdateRequest);
    }
}