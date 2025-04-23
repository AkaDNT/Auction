
using AuctionAPI.DTOs;
using AuctionAPI.Repositories;
using AuctionAPI.ServiceContracts;
using AutoMapper;
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

        public List<AuctionResponse> SearchAllAuctions(string searchTerm)
        {
            var auctions = _repo.GetAll();
            var searchTerms = searchTerm.Split([' '], StringSplitOptions.RemoveEmptyEntries);
            foreach (var term in searchTerms)
            {
                var searchTermCleaned = term.Trim().ToLower();  // Làm sạch từ khóa tìm kiếm
                auctions = auctions.Where(x => x.Seller.ToLower().Contains(searchTermCleaned)
                                               || x.Item.Make.ToLower().Contains(searchTermCleaned)
                                               || x.Item.Model.ToLower().Contains(searchTermCleaned)
                                               || x.Item.Color.ToLower().Contains(searchTermCleaned));

            }
            auctions = auctions.OrderBy(x => x.Item.Make);
            return _mapper.Map<List<AuctionResponse>>(auctions);
        }

        public async Task<List<AuctionResponse>> Search(string searchTerm, int pageNumber = 1, int pageSize = 8)
        {
            var auctions = _repo.GetAll();

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

            auctions = auctions.OrderBy(x => x.Item.Make).Skip((pageNumber - 1) * pageSize).Take(pageSize);
            var auctionResponses = _mapper.Map<List<AuctionResponse>>(await auctions.ToListAsync());
            return auctionResponses;
        }
    }
}