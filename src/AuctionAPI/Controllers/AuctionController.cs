
using AuctionAPI.DTOs;
using AuctionAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace AuctionAPI.Controllers
{
    [ApiController]
    [Route("api/auctions")]
    public class AuctionController : ControllerBase
    {
        private readonly IAuctionGetterService _auctionGetterService;

        public AuctionController(IAuctionGetterService auctionGetterService)
        {
            _auctionGetterService = auctionGetterService;
        }
        [HttpGet]
        public async Task<ActionResult<List<AuctionResponse>>> GetAllAuctions()
        {
            return await _auctionGetterService.GetAllAuctions();
        }
    }
}