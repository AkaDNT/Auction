using AuctionAPI.DTOs;
using AuctionAPI.Entities;
using AutoMapper;

namespace AuctionAPI.Mapper
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Auction, AuctionResponse>().IncludeMembers(x => x.Item);
            CreateMap<Item, AuctionResponse>();
        }
    }
}