using AuctionAPI.Entities;
using AuctionAPI.Enums;
using AuctionAPI.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AuctionAPI.Infrastructure
{
    public class AuctionDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
    {
        public AuctionDbContext(DbContextOptions options) : base(options)
        {
        }
        public DbSet<Auction> Auctions { get; set; }
        public DbSet<Item> Items { get; set; }
        public DbSet<Bid> Bids { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Auction>()
                .Property(a => a.Status)
                .HasConversion(
                    v => v.ToString(),  // Chuyển giá trị enum thành chuỗi
                    v => (Status)Enum.Parse(typeof(Status), v)  // Chuyển chuỗi thành enum
                );
            // Cấu hình mối quan hệ 1:1 giữa Auction và Items
            // modelBuilder.Entity<Item>()
            //     .HasOne(c => c.Auction)
            //     .WithOne(p => p.Item)
            //     .HasForeignKey<Item>(c => c.AuctionId);  // Khóa ngoại AuctionId trong Item

            base.OnModelCreating(modelBuilder);
        }

    }
}