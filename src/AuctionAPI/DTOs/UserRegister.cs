
using System.ComponentModel.DataAnnotations;

namespace AuctionAPI.DTOs
{
    public class UserRegister
    {
        [Required]
        [MinLength(2)]
        public string DisplayName { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        public string Password { get; set; }
    }
}