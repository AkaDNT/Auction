using System.ComponentModel.DataAnnotations;
using AuctionAPI.Identity;

namespace AuctionAPI.Entities
{
    public class Bid
    {
        [Required]
        public Guid Id { get; set; }
        [Range(1, int.MaxValue, ErrorMessage = "Amount must be more than 1$")]
        public int Amount { get; set; }
        public DateTime BidTime { get; set; } = DateTime.UtcNow;
        [Required]
        public Guid UserId { get; set; }
        public ApplicationUser User { get; set; }
        [Required]
        public Guid AuctionId { get; set; }
        public Auction Auction { get; set; }
    }
}