import { getDetailedAuction } from "@/app/actions/auctionAction";
import { CountdownTimer } from "@/app/components/CountdownTimer";
import Heading from "@/app/components/Heading";
import Image from "next/image";
import React from "react";
import DetailedSpecs from "./DetailedSpecs";
import UpdateButton from "./UpdateButton";
import { getCurrentUser } from "@/app/actions/getCurrentUser";
import DeleteButton from "./DeleteButton";
import BidSection from "@/app/auctions/details/[id]/BidSection";

export default async function Deatails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getDetailedAuction(id);
  const currentUser = await getCurrentUser();

  return (
    <>
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <Heading title={`${data.make} ${data.model}`}></Heading>
          {currentUser?.email === data.seller && (
            <>
              <UpdateButton id={data.id}></UpdateButton>
              <DeleteButton id={data.id}></DeleteButton>
            </>
          )}
        </div>
        <div className="flex gap-3">
          <h3 className="text-2xl font-semibold ">Time remaining:</h3>
          <CountdownTimer targetDate={data.auctionEnd}></CountdownTimer>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 mt-3">
        <div className="relative w-full bg-gray-200 aspect-[4/3] rounded-lg overflow-hidden">
          <div>
            <Image
              src={data.imageUrl}
              alt="Picture of the car"
              fill
              loading="lazy"
              className="rounded-lg"
            ></Image>
          </div>
        </div>
        <div className="border-2 rounded-lg p-2 bg-gray-200">
          <div className="pl-2">
            <Heading title="Bids"></Heading>
          </div>
          <BidSection user={currentUser} auction={data}></BidSection>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 rounded-lg">
        <DetailedSpecs auction={data}></DetailedSpecs>
      </div>
    </>
  );
}
