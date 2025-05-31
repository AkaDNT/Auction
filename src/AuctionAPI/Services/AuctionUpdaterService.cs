using AuctionAPI.DTOs;
using AuctionAPI.Entities;
using AuctionAPI.Repositories;
using AuctionAPI.ServiceContracts;
using AutoMapper;

namespace AuctionAPI.Services
{
    public class AuctionUpdaterService : IAuctionUpdaterService
    {
        private readonly IMapper _mapper;
        private readonly IAuctionRepository _repo;

        public AuctionUpdaterService(IAuctionRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<AuctionResponse> UpdateAuction(Guid ID, AuctionUpdateRequest auctionUpdateRequest, string sellerEmail)
        {
            Auction auction = await _repo.GetAuctionByID(ID);
            if (!auction.Seller.Equals(sellerEmail))
            {
                throw new UnauthorizedAccessException("Only the auction owner is allowed to update this auction.");
            }

            auction.Item.Make = auctionUpdateRequest.Make ?? auction.Item.Make;
            auction.Item.Model = auctionUpdateRequest.Model ?? auction.Item.Model;
            auction.Item.Color = auctionUpdateRequest.Color ?? auction.Item.Color;
            auction.Item.Mileage = auctionUpdateRequest.Mileage ?? auction.Item.Mileage;
            auction.Item.Year = auctionUpdateRequest.Year ?? auction.Item.Year;
            await _repo.UpdateAuction(ID, auction);
            return _mapper.Map<AuctionResponse>(auction);
        }
    }
}