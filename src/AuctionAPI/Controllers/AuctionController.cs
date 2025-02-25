
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
        private readonly IAuctionUpdaterService _auctionUpdaterService;
        private readonly IAuctionDeleterService _auctionDeleterService;

        public AuctionController(IAuctionGetterService auctionGetterService, IAuctionAdderService auctionAdderService, IAuctionUpdaterService auctionUpdaterService, IAuctionDeleterService auctionDeleterService)
        {
            _auctionGetterService = auctionGetterService;
            _auctionAdderService = auctionAdderService;
            _auctionUpdaterService = auctionUpdaterService;
            _auctionDeleterService = auctionDeleterService;
        }
        [HttpGet]
        public async Task<ActionResult<List<AuctionResponse>>> GetAllAuctions()
        {
            return await _auctionGetterService.GetAllAuctions();
        }
        [HttpGet("{ID}")]
        public async Task<ActionResult<AuctionResponse>> GetAuctionByID(Guid ID)
        {
            AuctionResponse auctionResponse = await _auctionGetterService.GetAuctionByID(ID);
            if (auctionResponse == null) return NotFound();
            return auctionResponse;
        }
        [HttpPost]
        public async Task<ActionResult<AuctionResponse>> CreateNewAuction(AuctionCreateRequest auctionCreateRequest)
        {
            AuctionResponse auctionResponse = await _auctionAdderService.CreateNewAuction(auctionCreateRequest);
            return CreatedAtAction(nameof(GetAuctionByID), new { auctionResponse.Id }, auctionResponse);
        }
        [HttpPut("{ID}")]
        public async Task<ActionResult<AuctionResponse>> UpdateAuction(Guid ID, AuctionUpdateRequest auctionUpdateRequest)
        {
            AuctionResponse auctionResponse = await _auctionUpdaterService.UpdateAuction(ID, auctionUpdateRequest);
            return Ok(auctionResponse);
        }
        [HttpDelete("{ID}")]
        public async Task<ActionResult> DeleteAuction(Guid ID)
        {
            var deleted = await _auctionDeleterService.DeleteAuction(ID);
            if (deleted <= 0) return BadRequest();
            return Ok();
        }
    }
}