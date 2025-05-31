import { Button } from "flowbite-react";
import Link from "next/link";
import React from "react";

type Props = {
  id: string;
};

export default function UpdateButton({ id }: Props) {
  return (
    <Button className="cursor-pointer" color="green">
      <Link href={`/auctions/update/${id}`}>Update Auction</Link>
    </Button>
  );
}
