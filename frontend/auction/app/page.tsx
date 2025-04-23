import Listing from "./auctions/Listing";
import SortAndFilter from "./components/SortAndFilter";

export default function Home() {
  return (
    <div>
      <SortAndFilter></SortAndFilter>
      <Listing></Listing>
    </div>
  );
}
