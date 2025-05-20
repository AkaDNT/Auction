import React from "react";
import SortAndFilter from "../components/SortAndFilter";
import Listing from "../auctions/Listing";

export default function page() {
  return (
    <div>
      <SortAndFilter></SortAndFilter>
      <Listing></Listing>
    </div>
  );
}
