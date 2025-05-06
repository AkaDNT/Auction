
using AuctionAPI.DTOs;
using AuctionAPI.Identity;
using AuctionAPI.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AuctionAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly UserManager<ApplicationUser> _userManager;

        public AccountController(IMediator mediator, UserManager<ApplicationUser> userManager)
        {
            _mediator = mediator;
            _userManager = userManager;
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult> CreateUser(UserRegister userRegister)
        {
            await _mediator.Send(new UserRegisterService.Command { userRegister = userRegister });
            return Ok();
        }

        [AllowAnonymous]
        [HttpGet("me")]
        public async Task<ActionResult> GetMe()
        {
            if (User.Identity.IsAuthenticated == false) return NoContent();
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();
            return Ok(new
            {
                user.DisplayName,
                user.Email,
                user.Id,
                user.ImageUrl
            });
        }

    }
}