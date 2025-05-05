using AuctionAPI.DTOs;
using AuctionAPI.Entities;
using AuctionAPI.Identity;
using AutoMapper;

namespace AuctionAPI.Mapper
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Auction, AuctionResponse>().IncludeMembers(x => x.Item);
            CreateMap<Item, AuctionResponse>();
            CreateMap<AuctionCreateRequest, Auction>()
    .ForMember(d => d.Item, o => o.MapFrom(s => new Item
    {
        Make = s.Make,
        Model = s.Model,
        Color = s.Color,
        Mileage = s.Mileage,
        Year = s.Year,
        ImageUrl = s.ImageUrl
    }));
            CreateMap<UserRegister, ApplicationUser>().ForMember(d => d.UserName, o => o.MapFrom(s => s.Email));
        }
    }
}