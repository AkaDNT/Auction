

using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace AuctionAPI.Identity
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        [Required]
        [MinLength(2)]
        public string DisplayName { get; set; }
        public string Bio { get; set; }
        public string ImageUrl { get; set; } = "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png";
    }
}