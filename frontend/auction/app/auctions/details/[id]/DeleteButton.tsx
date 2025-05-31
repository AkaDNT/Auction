"use client";

import { deleteAuction } from "@/app/actions/auctionAction";
import { Button, Spinner } from "flowbite-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  id: string;
};

export default function DeleteButton({ id }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleDeleteAuction() {
    setLoading(true);
    deleteAuction(id)
      .then((res) => {
        if (res.error) throw res.error;
        router.push("/");
      })
      .catch((error) => {
        toast.error(error.status + " " + error.message);
      });
  }

  return (
    <Button
      onClick={handleDeleteAuction}
      className="cursor-pointer"
      color="red"
    >
      {loading && <Spinner size="sm" className="mr-3"></Spinner>}
      Delete Auction
    </Button>
  );
}
