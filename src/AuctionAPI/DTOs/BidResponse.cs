
namespace AuctionAPI.DTOs
{
    public class BidResponse
    {
        public Guid Id { get; set; }
        public int Amount { get; set; }
        public DateTime BidTime { get; set; } = DateTime.UtcNow;
        public Guid UserId { get; set; }
        public Guid AuctionId { get; set; }

        public string DisplayName { get; set; }
    }
}