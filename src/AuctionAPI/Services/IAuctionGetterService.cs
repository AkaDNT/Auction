using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AuctionAPI.DTOs;
using AuctionAPI.Entities;

namespace AuctionAPI.Services
{
    public interface IAuctionGetterService
    {
        Task<List<AuctionResponse>> GetAllAuctions();
    }
}