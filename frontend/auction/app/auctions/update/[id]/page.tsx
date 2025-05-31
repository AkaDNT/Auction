import Heading from "@/app/components/Heading";
import React from "react";
import AuctionForm from "../../AuctionForm";
import { getDetailedAuction } from "@/app/actions/auctionAction";

export default async function UpdateAuction({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auction = await getDetailedAuction(id);
  return (
    <div>
      <Heading
        title="Update your auction"
        subtitle="Please update the details of your car (Only these auction properties can be updated)"
      ></Heading>
      <AuctionForm auction={auction}></AuctionForm>
    </div>
  );
}
