using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AuctionAPI.Entities;
using AuctionAPI.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace AuctionAPI.Repositories
{
    public class AuctionRepository : IAuctionRepository
    {
        private readonly AuctionDbContext _db;

        public AuctionRepository(AuctionDbContext db)
        {
            _db = db;
        }

        public async Task<Auction> CreateNewAuction(Auction auction)
        {
            await _db.Auctions.AddAsync(auction);
            await _db.SaveChangesAsync();
            return auction;
        }

        public async Task<int> DeleteAuction(Guid ID)
        {
            Auction auction = await GetAuctionByID(ID);
            _db.Remove(auction);
            int deleted = await _db.SaveChangesAsync();
            return deleted;
        }

        public async Task<List<Auction>> GetAllAuctions()
        {
            return await _db.Auctions.Include(x => x.Item).OrderBy(x => x.Item.Make).ToListAsync();
        }

        public async Task<Auction> GetAuctionByID(Guid ID)
        {
            return await _db.Auctions.Include(x => x.Item).FirstOrDefaultAsync(x => x.Id == ID);
        }

        public async Task<Auction> UpdateAuction(Guid ID, Auction auctionUpdated)
        {
            Auction auction = await GetAuctionByID(ID);
            auction = auctionUpdated;
            await _db.SaveChangesAsync();
            return auction;
        }
    }
}