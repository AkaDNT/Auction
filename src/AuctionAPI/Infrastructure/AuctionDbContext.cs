using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AuctionAPI.Entities;
using AuctionAPI.Enums;
using Microsoft.EntityFrameworkCore;

namespace AuctionAPI.Infrastructure
{
    public class AuctionDbContext : DbContext
    {
        public AuctionDbContext(DbContextOptions options) : base(options)
        {
        }
        public DbSet<Auction> Auctions { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Auction>()
                .Property(a => a.Status)
                .HasConversion(
                    v => v.ToString(),  // Chuyển giá trị enum thành chuỗi
                    v => (Status)Enum.Parse(typeof(Status), v)  // Chuyển chuỗi thành enum
                );
        }

    }
}