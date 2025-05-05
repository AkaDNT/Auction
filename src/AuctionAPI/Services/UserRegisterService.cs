
using AuctionAPI.DTOs;
using AuctionAPI.Identity;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace AuctionAPI.Services
{
    public class UserRegisterService
    {
        public class Command : IRequest
        {
            public UserRegister userRegister { get; set; }
        }
        public class Handler : IRequestHandler<Command>
        {
            private readonly UserManager<ApplicationUser> _userManager;
            private readonly IMapper _mapper;

            public Handler(UserManager<ApplicationUser> userManager, IMapper mapper)
            {
                _userManager = userManager;
                _mapper = mapper;
            }

            public async Task Handle(Command request, CancellationToken cancellationToken)
            {
                var user =
                _mapper.Map<ApplicationUser>(request.userRegister);
                var result = await _userManager.CreateAsync(user, request.userRegister.Password);
                if (!result.Succeeded)
                {
                    var error = "";
                    foreach (var err in result.Errors)
                    {
                        error += err.Description;
                    }
                    throw new ApplicationException(error);
                }
            }
        }
    }
}