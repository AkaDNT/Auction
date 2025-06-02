
using AuctionAPI.Services;
using MediatR;
using Microsoft.AspNetCore.SignalR;

namespace AuctionAPI.SignalR
{
    public class BidHub : Hub
    {
        private readonly IMediator _mediator;

        public BidHub(IMediator mediator)
        {
            _mediator = mediator;
        }

        public async Task SendBid(BidAdderService.Command command)
        {
            var bid = await _mediator.Send(command);
            await Clients.Group(command.AuctionId.ToString()).SendAsync("ReceiveBid", bid);
        }

        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var auctionIdStr = httpContext.Request.Query["auctionId"];
            if (string.IsNullOrEmpty(auctionIdStr) || !Guid.TryParse(auctionIdStr, out Guid auctionId))
            {
                throw new HubException("No auction with this id.");
            }
            await Groups.AddToGroupAsync(Context.ConnectionId, auctionId.ToString());

            var result = await _mediator.Send(new BidGetterService.Query { auctionId = auctionId });

            await Clients.Caller.SendAsync("LoadBids", result);
            await base.OnConnectedAsync();
        }
    }
}