
using AuctionAPI.DTOs;
using AuctionAPI.Entities;
using AuctionAPI.Identity;
using AuctionAPI.Repositories;
using AuctionAPI.ServiceContracts;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AuctionAPI.Services
{
    public class SearchService : ISearchService
    {
        private readonly IAuctionRepository _repo;
        private readonly IMapper _mapper;

        public SearchService(IAuctionRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        private IQueryable<Auction> Search(string searchTerm, IQueryable<Auction> auctions)
        {
            if (!string.IsNullOrEmpty(searchTerm))
            {
                var searchTerms = searchTerm.Split([' '], StringSplitOptions.RemoveEmptyEntries);

                foreach (var term in searchTerms)
                {
                    var searchTermCleaned = term.Trim().ToLower();  // Làm sạch từ khóa tìm kiếm
                    auctions = auctions.Where(x => x.Seller.ToLower().Contains(searchTermCleaned)
                                                   || x.Item.Make.ToLower().Contains(searchTermCleaned)
                                                   || x.Item.Model.ToLower().Contains(searchTermCleaned)
                                                   || x.Item.Color.ToLower().Contains(searchTermCleaned));

                }

            }
            return auctions;
        }

        private IQueryable<Auction> Filter(int filter, IQueryable<Auction> auctions)
        {
            switch (filter)
            {
                case 1:
                    {
                        auctions = auctions.Where(auction => auction.AuctionEnd > DateTime.Now).AsQueryable();
                        break;
                    }
                case 2:
                    {
                        auctions = auctions.Where(auction => auction.AuctionEnd <= DateTime.Now).AsQueryable();
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
            return auctions;
        }

        private IQueryable<Auction> Sort(int sort, IQueryable<Auction> auctions)
        {
            switch (sort)
            {
                case 1:
                    {
                        auctions = auctions.OrderBy(x => x.Item.Year);
                        break;
                    }
                case 2:
                    {
                        auctions = auctions.OrderBy(x => x.AuctionEnd);
                        break;
                    }
                case 3:
                    {
                        auctions = auctions.OrderByDescending(x => x.UpdatedAt);
                        break;
                    }
                default:
                    {
                        auctions = auctions.OrderBy(x => x.Item.Make);
                        break;
                    }
            }
            return auctions;
        }

        public List<AuctionResponse> SearchAllAuctions(string searchTerm, int filter)
        {
            var auctions = _repo.GetAll();
            auctions = Search(searchTerm, auctions);
            auctions = Filter(filter, auctions);
            return _mapper.Map<List<AuctionResponse>>(auctions);
        }

        public List<AuctionResponse> SearchAllMyAuctions(string email, string searchTerm, int filter)
        {
            var auctions = _repo.GetAll().Where(a => a.Seller == email);
            auctions = Search(searchTerm, auctions);
            auctions = Filter(filter, auctions);
            return _mapper.Map<List<AuctionResponse>>(auctions);
        }

        public async Task<List<AuctionResponse>> Search(string searchTerm, int pageNumber, int pageSize, int sort, int filter)
        {
            var auctions = _repo.GetAll();

            auctions = Search(searchTerm, auctions);
            auctions = Sort(sort, auctions);
            auctions = Filter(filter, auctions);

            auctions = auctions.Skip((pageNumber - 1) * pageSize).Take(pageSize);
            var auctionResponses = _mapper.Map<List<AuctionResponse>>(await auctions.ToListAsync());
            return auctionResponses;
        }

        public async Task<List<AuctionResponse>> GetMyAuctions(string sellerEmail, string searchTerm, int pageNumber, int pageSize, int sort, int filter)
        {
            var auctions = _repo.GetAll().Where(a => a.Seller == sellerEmail);
            auctions = Search(searchTerm, auctions);
            auctions = Sort(sort, auctions);
            auctions = Filter(filter, auctions);

            auctions = auctions.Skip((pageNumber - 1) * pageSize).Take(pageSize);
            var auctionResponses = _mapper.Map<List<AuctionResponse>>(await auctions.ToListAsync());
            return auctionResponses;
        }
    }
}