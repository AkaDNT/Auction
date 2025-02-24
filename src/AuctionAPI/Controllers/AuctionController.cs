
using AuctionAPI.DTOs;
using AuctionAPI.Entities;
using AuctionAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace AuctionAPI.Controllers
{
    [ApiController]
    [Route("api/auctions")]
    public class AuctionController : ControllerBase
    {
        private readonly IAuctionGetterService _auctionGetterService;
        private readonly IAuctionAdderService _auctionAdderService;

        public AuctionController(IAuctionGetterService auctionGetterService, IAuctionAdderService auctionAdderService)
        {
            _auctionGetterService = auctionGetterService;
            _auctionAdderService = auctionAdderService;
        }
        [HttpGet]
        public async Task<ActionResult<List<AuctionResponse>>> GetAllAuctions()
        {
            return await _auctionGetterService.GetAllAuctions();
        }
        [HttpGet("{ID}")]
        public async Task<ActionResult<AuctionResponse>> GetAuctionByID(Guid ID)
        {
            return await _auctionGetterService.GetAuctionByID(ID);
        }
        [HttpPost]
        public async Task<ActionResult<AuctionResponse>> CreateNewAuction(AuctionCreateRequest auctionCreateRequest)
        {
            AuctionResponse auctionResponse = await _auctionAdderService.CreateNewAuction(auctionCreateRequest);
            return CreatedAtAction(nameof(GetAuctionByID), new { auctionResponse.Id }, auctionResponse);
        }
    }
}