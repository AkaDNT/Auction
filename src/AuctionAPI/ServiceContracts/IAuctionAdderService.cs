using AuctionAPI.DTOs;

namespace AuctionAPI.ServiceContracts
{
    public interface IAuctionAdderService
    {
        Task<AuctionResponse> CreateNewAuction(String sellerEmail, AuctionCreateRequest auctionCreateRequest);
    }
}