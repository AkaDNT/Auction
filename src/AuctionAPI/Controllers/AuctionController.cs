
using System.Security.Claims;
using AuctionAPI.DTOs;
using AuctionAPI.ServiceContracts;
using Microsoft.AspNetCore.Authorization;
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
        [AllowAnonymous]
        public async Task<ActionResult<List<AuctionResponse>>> GetAllAuctions()
        {
            return await _auctionGetterService.GetAllAuctions();
        }
        [HttpGet("{ID}")]
        [AllowAnonymous]
        public async Task<ActionResult<AuctionResponse>> GetAuctionByID(Guid ID)
        {
            AuctionResponse auctionResponse = await _auctionGetterService.GetAuctionByID(ID);
            if (auctionResponse == null) return NotFound();
            return auctionResponse;
        }
        [HttpPost]
        public async Task<ActionResult<AuctionResponse>> CreateNewAuction(AuctionCreateRequest auctionCreateRequest)
        {
            var sellerEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            AuctionResponse auctionResponse = await _auctionAdderService.CreateNewAuction(sellerEmail, auctionCreateRequest);
            return CreatedAtAction(nameof(GetAuctionByID), new { auctionResponse.Id }, auctionResponse);
        }
        [HttpPut("{ID}")]
        public async Task<ActionResult<AuctionResponse>> UpdateAuction(Guid ID, AuctionUpdateRequest auctionUpdateRequest)
        {
            try
            {
                var sellerEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                AuctionResponse auctionResponse = await _auctionUpdaterService.UpdateAuction(ID, auctionUpdateRequest, sellerEmail);
                return Ok(auctionResponse);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid("Only auction owner is allowed to update their auction");
            }
        }
        [HttpDelete("{ID}")]
        public async Task<ActionResult> DeleteAuction(Guid ID)
        {
            string sellerEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            var deleted = await _auctionDeleterService.DeleteAuction(ID, sellerEmail);
            if (deleted <= 0) return BadRequest();
            return Ok();
        }
    }
}