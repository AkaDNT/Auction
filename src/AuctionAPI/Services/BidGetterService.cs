
using AuctionAPI.DTOs;
using AuctionAPI.Infrastructure;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AuctionAPI.Services
{
    public class BidGetterService
    {
        public class Query : IRequest<List<BidResponse>>
        {
            public Guid auctionId { get; set; }
        }
        public class Handler : IRequestHandler<Query, List<BidResponse>>
        {
            private readonly AuctionDbContext _dbContext;
            private readonly IMapper _mapper;

            public Handler(AuctionDbContext dbContext, IMapper mapper)
            {
                _dbContext = dbContext;
                _mapper = mapper;
            }

            public async Task<List<BidResponse>> Handle(Query request, CancellationToken cancellationToken)
            {
                var bids = await _dbContext.Bids
        .Where(b => b.AuctionId == request.auctionId)
        .OrderByDescending(b => b.BidTime)
        .ToListAsync(cancellationToken);

                return _mapper.Map<List<BidResponse>>(bids);
            }
        }
    }
}