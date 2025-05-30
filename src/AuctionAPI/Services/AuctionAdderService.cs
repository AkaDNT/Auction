using AuctionAPI.DTOs;
using AuctionAPI.Entities;
using AuctionAPI.Identity;
using AuctionAPI.Repositories;
using AuctionAPI.ServiceContracts;
using AutoMapper;
using Microsoft.AspNetCore.Identity;

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

        public async Task<AuctionResponse> CreateNewAuction(String sellerEmail, AuctionCreateRequest auctionCreateRequest)
        {
            Auction auction = _mapper.Map<Auction>(auctionCreateRequest);
            auction.Seller = sellerEmail;
            await _repo.CreateNewAuction(auction);
            return _mapper.Map<AuctionResponse>(auction);
        }
    }
}