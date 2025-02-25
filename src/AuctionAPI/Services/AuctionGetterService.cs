using AuctionAPI.DTOs;
using AuctionAPI.Entities;
using AuctionAPI.Repositories;
using AuctionAPI.ServiceContracts;
using AutoMapper;

namespace AuctionAPI.Services
{
    public class AuctionGetterService : IAuctionGetterService
    {
        private readonly IAuctionRepository _repo;
        private readonly IMapper _mapper;

        public AuctionGetterService(IAuctionRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<List<AuctionResponse>> GetAllAuctions()
        {
            List<Auction> auctions = await _repo.GetAllAuctions();
            List<AuctionResponse> auctionResponses = _mapper.Map<List<AuctionResponse>>(auctions);
            return auctionResponses;
        }

        public async Task<AuctionResponse> GetAuctionByID(Guid ID)
        {
            Auction auction = await _repo.GetAuctionByID(ID);
            if (auction == null) return null;
            return _mapper.Map<AuctionResponse>(auction);
        }
    }
}