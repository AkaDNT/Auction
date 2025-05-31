using AuctionAPI.Identity;

namespace AuctionAPI.Entities
{
    public class Bid
    {
        public Guid Id { get; set; }
        public int Amount { get; set; }
        public DateTime BidTime { get; set; } = DateTime.UtcNow;
        public Guid UserId { get; set; }
        public ApplicationUser User { get; set; }
        public Guid AuctionId { get; set; }
        public Auction Auction { get; set; }
    }
}