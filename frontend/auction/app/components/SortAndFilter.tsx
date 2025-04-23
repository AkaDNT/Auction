"use client";
import { Button, ButtonGroup } from "flowbite-react";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { CiViewTimeline } from "react-icons/ci";
import { GiTimeBomb } from "react-icons/gi";
import { MdMoreTime } from "react-icons/md";

const sortButtons = [
  {
    tilte: "Year",
    value: 1,
    icon: <CiViewTimeline size={24} color="red"></CiViewTimeline>,
  },
  {
    tilte: "End date",
    value: 2,
    icon: <GiTimeBomb size={24} color="red"></GiTimeBomb>,
  },
  {
    tilte: "Recently update",
    value: 3,
    icon: <MdMoreTime size={24} color="red"></MdMoreTime>,
  },
];

export default function SortAndFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const handleClickSort = (value: number) => {
    const p = new URLSearchParams(params.toString());
    p.set("o", `${value}`);
    router.push(`?${p.toString()}`);
  };
  const handleClickOrderByButton = () => {
    const p = new URLSearchParams(params.toString());
    p.delete("o");
    router.push(`?${p.toString()}`);
  };
  const searchParams = useSearchParams();
  const value = searchParams.get("o") ?? 0;
  console.log(value);
  return (
    <div className="flex justify-between items-center mb-3 font-sans font-semibold">
      <div className="flex items-center">
        <button
          onClick={handleClickOrderByButton}
          className="bg-gray-100 rounded-xl p-2 mr-2 cursor-pointer"
        >
          ORDER BY
        </button>
        <ButtonGroup className="rounded-xl">
          {sortButtons.map((b) => (
            <Button
              key={b.value}
              onClick={() => handleClickSort(b.value)}
              className={`mr-0.5 cursor-pointer ${
                b.value == value
                  ? "bg-black text-white"
                  : "bg-gray-300 text-black"
              }`}
              color={"white"}
            >
              {b.icon} {b.tilte}
            </Button>
          ))}
        </ButtonGroup>
      </div>
      <label className="bg-gray-200 rounded-xl p-2">FILTER BY</label>
    </div>
  );
}
