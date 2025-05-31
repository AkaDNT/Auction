using System.ComponentModel.DataAnnotations;

namespace AuctionAPI.DTOs
{
    public class AuctionCreateRequest
    {
        [Required]
        public string Make { get; set; }
        [Required]
        public string Model { get; set; }
        [Required]
        public string Color { get; set; }
        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Mileage can't be negative")]
        public int Mileage { get; set; } = 0;
        [Required]
        [Range(1900, 2025, ErrorMessage = "Year must be between 1900 and 2025")]
        public int Year { get; set; }
        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Reserve price can't be negative")]
        public int ReservePrice { get; set; } = 0;
        [Required]
        public string ImageUrl { get; set; }
        [Required]
        public DateTime AuctionEnd { get; set; }
    }
}