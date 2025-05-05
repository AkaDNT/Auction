
using AuctionAPI.DTOs;
using AuctionAPI.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuctionAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AccountController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult> CreateUser(UserRegister userRegister)
        {
            await _mediator.Send(new UserRegisterService.Command { userRegister = userRegister });
            return Ok();
        }

    }
}