import { getDetailedAuction } from "@/app/actions/auctionAction";
import React from "react";

export default async function Deatails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = getDetailedAuction(id);

  return <div>page</div>;
}
