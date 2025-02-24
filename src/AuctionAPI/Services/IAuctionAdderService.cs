
using AuctionAPI.DTOs;

namespace AuctionAPI.Services
{
    public interface IAuctionAdderService
    {
        Task<AuctionResponse> CreateNewAuction(AuctionCreateRequest auctionCreateRequest);
    }
}