import React from "react";
import { Auction } from "../models/Auction";
import Image from "next/image";
import { CountdownTimer } from "../components/CountdownTimer";
import Link from "next/link";

interface Props {
  auction: Auction;
}

export default function AuctionCard({ auction }: Props) {
  return (
    <Link href={`/auctions/details/${auction.id}`}>
      <div className="bg-gray-200 aspect-video relative rounded-lg">
        <Image
          src={auction.imageUrl}
          alt="Picture of the car"
          fill
          loading="lazy"
          className="rounded-lg"
        ></Image>
      </div>
      <div className="flex justify-between items-center ">
        <h3>
          {auction.make} {auction.model}
        </h3>
        <p className="font-sans font-bold">{auction.year}</p>
      </div>
      <CountdownTimer targetDate={auction.auctionEnd}></CountdownTimer>
    </Link>
  );
}
