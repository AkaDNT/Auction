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
            this._db = db;
        }

        public async Task<List<Auction>> GetAllAuctions()
        {
            return await _db.Auctions.Include(x => x.Item).OrderBy(x => x.Item.Make).ToListAsync();
        }
    }
}