using AuctionAPI.DTOs;
using AuctionAPI.Entities;
using AuctionAPI.Repositories;
using AutoMapper;

namespace AuctionAPI.Services
{
    public class AuctionAdderService : IAuctionAdderService
    {
        private readonly IMapper _mapper;
        private readonly IAuctionRepository _repo;

        public AuctionAdderService(IMapper mapper, IAuctionRepository repo)
        {
            _mapper = mapper;
            _repo = repo;
        }

        public async Task<AuctionResponse> CreateNewAuction(AuctionCreateRequest auctionCreateRequest)
        {
            Auction auction = _mapper.Map<Auction>(auctionCreateRequest);
            auction.Seller = "Test";
            await _repo.CreateNewAuction(auction);
            return _mapper.Map<AuctionResponse>(auction);
        }
    }
}