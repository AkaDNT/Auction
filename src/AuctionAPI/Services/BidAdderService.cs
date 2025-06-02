using AuctionAPI.DTOs;
using AuctionAPI.Entities;
using AuctionAPI.Infrastructure;
using AuctionAPI.ServiceContracts;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AuctionAPI.Services
{
    public class BidAdderService
    {
        public class Command : IRequest<BidResponse>
        {
            public Guid AuctionId { get; set; }
            public int Amount { get; set; }

            public Guid UserId { get; set; }
        }

        public class Handler : IRequestHandler<Command, BidResponse>
        {
            private readonly IUserAccessorService _userAccessorService;
            private readonly AuctionDbContext _dbContext;
            private readonly IMapper _mapper;

            public Handler(IUserAccessorService userAccessorService, AuctionDbContext dbContext, IMapper mapper)
            {
                _userAccessorService = userAccessorService;
                _dbContext = dbContext;
                _mapper = mapper;
            }

            public async Task<BidResponse> Handle(Command request, CancellationToken cancellationToken)
            {
                var user = await _userAccessorService.GetApplicationUserAsync(request.UserId);
                if (user == null) throw new Exception("Unauthorized");

                var auction = await _dbContext.Auctions.Include(x => x.Bids)
                .FirstOrDefaultAsync(auc => auc.Id == request.AuctionId);
                if (auction == null) throw new Exception("Could not find auction");

                if (user.Email.Equals(auction.Seller)) throw new Exception("You can not bid your auction");

                if (auction.CurrentHighBid == 0)
                {
                    if (auction.ReservePrice == 0)
                    {
                        auction.CurrentHighBid = request.Amount;
                    }
                    else
                    {
                        if (request.Amount > auction.ReservePrice) auction.CurrentHighBid = request.Amount;
                        else throw new Exception("Your bid is below the reserve price");
                    }
                }
                else
                {
                    if (request.Amount > auction.CurrentHighBid) auction.CurrentHighBid = request.Amount;
                    else throw new Exception("Your bid is below current high bid");
                }

                var bid = new Bid
                {
                    Amount = request.Amount,
                    UserId = user.Id,
                    AuctionId = auction.Id,
                };

                auction.Bids.Add(bid);

                var bidResponse = _mapper.Map<BidResponse>(bid);

                var saved = await _dbContext.SaveChangesAsync(cancellationToken) > 0;
                if (!saved) throw new Exception("Save new bid failed");

                return _mapper.Map<BidResponse>(bid);
            }
        }
    }
}