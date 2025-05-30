import Heading from "@/app/components/Heading";
import React from "react";
import AuctionForm from "../AuctionForm";

export default function page() {
  return (
    <div className="mx-auto max-w-[75%] shadow-lg p-10 bg-white rounded-lg">
      <Heading
        title="Sell your car"
        subtitle="Please enter the details of your car"
      ></Heading>
      <AuctionForm></AuctionForm>
    </div>
  );
}
