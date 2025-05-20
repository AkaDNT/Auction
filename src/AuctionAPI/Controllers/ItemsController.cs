using System.Security.Claims;
using AuctionAPI.DTOs;
using AuctionAPI.ServiceContracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuctionAPI.Controllers
{
    [ApiController]
    [Route("api/search")]
    public class ItemsController : ControllerBase
    {
        private readonly ISearchService _searchService;

        public ItemsController(ISearchService searchService)
        {
            _searchService = searchService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<AuctionResponse>>> GetAllItem([FromQuery] int sort,
    [FromQuery] int filter,
    [FromQuery] string searchTerm = "",
    [FromQuery] int pageNumber = 1,
    [FromQuery] int pageSize = 8)
        {
            var auctionResponses = await _searchService.Search(searchTerm, pageNumber, pageSize, sort, filter);
            var allAuctions = _searchService.SearchAllAuctions(searchTerm, filter);
            int count = allAuctions.Count();
            return Ok(new
            {
                results = auctionResponses,
                pageCount = count % pageSize == 0 ? count / pageSize : count / pageSize + 1,
                totalCount = auctionResponses.Count,
            });
        }
        [HttpGet("my-auctions")]
        [AllowAnonymous]

        public async Task<ActionResult> GetMyAuctions(
    [FromQuery] int sort,
    [FromQuery] int filter,
    [FromQuery] string searchTerm = "",
    [FromQuery] int pageNumber = 1,
    [FromQuery] int pageSize = 8)
        {

            var sellerEmail = User.FindFirst(ClaimTypes.Email)?.Value;

            if (string.IsNullOrEmpty(sellerEmail))
                return Unauthorized();

            // Gọi service
            var myAuctions = await _searchService.GetMyAuctions(
                sellerEmail,
                searchTerm,
                pageNumber,
                pageSize,
                sort,
                filter
            );

            // Tính toán pagination
            var allMyAuctions = _searchService.SearchAllMyAuctions(sellerEmail, searchTerm, filter);
            int count = allMyAuctions.Count;

            return Ok(new
            {
                results = myAuctions,
                pageCount = (int)Math.Ceiling(count / (double)pageSize),
                totalCount = count
            });
        }
    }
}
