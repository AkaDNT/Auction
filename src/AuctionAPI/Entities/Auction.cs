using System.ComponentModel.DataAnnotations;
using AuctionAPI.Enums;

namespace AuctionAPI.Entities
{
    public class Auction
    {
        [Required]
        public Guid Id { get; set; }
        [Required]
        public int ReservePrice { get; set; } = 0;
        [Required]
        public string Seller { get; set; }
        public string Winner { get; set; } = "";
        [Required]
        public int? SoldAmount { get; set; } = 0;
        public int? CurrentHighBid { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime AuctionEnd { get; set; }
        public Status Status { get; set; } = Status.Live;
        public Item Item { get; set; }
        public ICollection<Bid> Bids { get; set; } = [];
    }
}