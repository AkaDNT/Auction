using AuctionAPI.DTOs;

namespace AuctionAPI.ServiceContracts
{
    public interface IAuctionAdderService
    {
        Task<AuctionResponse> CreateNewAuction(AuctionCreateRequest auctionCreateRequest);
    }
}