using AuctionAPI.DTOs;
using AuctionAPI.ServiceContracts;
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
        public async Task<ActionResult<List<AuctionResponse>>> GetAllItem([FromQuery] string searchTerm = " ", int pageNumber = 1, int pageSize = 8)
        {
            var auctionResponses = await _searchService.Search(searchTerm, pageNumber, pageSize);
            var allAuctions = _searchService.SearchAllAuctions(searchTerm);
            int count = allAuctions.Count();
            return Ok(new
            {
                results = auctionResponses,
                pageCount = count % pageSize == 0 ? count / pageSize : count / pageSize + 1,
                totalCount = auctionResponses.Count,
            });
        }
    }
}
