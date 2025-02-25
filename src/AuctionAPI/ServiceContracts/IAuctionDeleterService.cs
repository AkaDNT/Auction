namespace AuctionAPI.ServiceContracts
{
    public interface IAuctionDeleterService
    {
        Task<int> DeleteAuction(Guid ID);
    }
}