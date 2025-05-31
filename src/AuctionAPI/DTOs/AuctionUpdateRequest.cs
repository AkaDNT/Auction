using System.ComponentModel.DataAnnotations;

namespace AuctionAPI.DTOs
{
    public class AuctionUpdateRequest
    {
        public string Make { get; set; }
        public string Model { get; set; }
        public string Color { get; set; }
        [Range(0, int.MaxValue, ErrorMessage = "Mileage can't be negative")]
        public int? Mileage { get; set; }
        [Range(1900, 2025, ErrorMessage = "Year must be between 1900 and 2025")]
        public int? Year { get; set; }
    }
}