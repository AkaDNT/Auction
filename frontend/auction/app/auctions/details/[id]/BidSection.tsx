"use client";

import React from "react";
import { useBids } from "../../../hooks/useBids";
import { FieldValues, useForm } from "react-hook-form";
import BidItem from "./BidItem";
import { Spinner, Textarea } from "flowbite-react";
import { observer } from "mobx-react-lite";
import Heading from "@/app/components/Heading";
import { numberWithCommas } from "@/lib/numberWithCommas";
import { CurrentUser } from "@/app/actions/getCurrentUser";
import { Auction } from "@/app/models/Auction";
import { isAfter, parseISO } from "date-fns";

type Props = {
  user: CurrentUser | null;
  auction: Auction;
};

const BidSection = observer(function BidSection({ user, auction }: Props) {
  const { bidStore } = useBids(auction.id);
  const end = parseISO(auction.auctionEnd as unknown as string);
  const open = isAfter(end, new Date());
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  const addBid = async (data: FieldValues) => {
    try {
      await bidStore.hubConnection?.invoke("SendBid", {
        auctionId: auction.id,
        amount: Number(data.amount),
        userId: user?.id,
      });
      reset();
    } catch (error) {
      console.log(error);
    }
  };
  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(addBid)();
    }
  };
  return (
    <div className="rounded-lg shadow-md">
      <div className="py-2 px-4">
        <div className="flex items-center justify-center p-2 text-lg font-semibold">
          <Heading
            title={`Current high bid is $${numberWithCommas(
              auction.currentHighBid
            )}`}
          />
        </div>
      </div>
      <div className="overflow-auto h-[370px] flex flex-col-reverse px-2">
        {bidStore.bids.map((bid) => (
          <BidItem key={bid.id} bid={bid}></BidItem>
        ))}
      </div>
      <div className="px-2 pb-2 text-gray-500">
        {!open ? (
          <div className="flex items-center justify-center p-2 text-lg font-semibold">
            This auction has finished
          </div>
        ) : !user ? (
          <div className="flex items-center justify-center p-2 text-lg font-semibold">
            Please login to place a bid
          </div>
        ) : user && user.email === auction.seller ? (
          <div className="flex items-center justify-center p-2 text-lg font-semibold">
            You cannot bid on your own auction
          </div>
        ) : (
          <form>
            <div className="relative">
              <Textarea
                {...register("amount", { required: true })}
                placeholder="Enter your bid (Enter to submit)"
                rows={2}
                onKeyDown={handleKeyPress}
                className="resize-none"
              />
              {isSubmitting && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Spinner size="sm" />
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
});
export default BidSection;
