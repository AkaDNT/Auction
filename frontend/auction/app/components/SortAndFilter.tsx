"use client";
import { Button, ButtonGroup } from "flowbite-react";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { CiViewTimeline } from "react-icons/ci";
import { GiTimeBomb } from "react-icons/gi";
import { MdMoreTime, MdOutlineDownloadDone } from "react-icons/md";
import { SiFireflyiii } from "react-icons/si";

const sortButtons = [
  {
    title: "Year",
    value: 1,
    icon: <CiViewTimeline size={24} color="red"></CiViewTimeline>,
  },
  {
    title: "End date",
    value: 2,
    icon: <GiTimeBomb size={24} color="red"></GiTimeBomb>,
  },
  {
    title: "Recently update",
    value: 3,
    icon: <MdMoreTime size={24} color="red"></MdMoreTime>,
  },
];

const filterButtons = [
  {
    title: "Live",
    value: 1,
    icon: <SiFireflyiii size={24} color="red" />,
  },
  {
    title: "Complete",
    value: 2,
    icon: <MdOutlineDownloadDone size={24} color="red" />,
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
  const handleClickFilterButton = (value: number) => {
    const p = new URLSearchParams(params.toString());
    p.set("f", `${value}`);
    router.push(`?${p.toString()}`);
  };
  const handleClickFilterByButton = () => {
    const p = new URLSearchParams(params.toString());
    p.delete("f");
    router.push(`?${p.toString()}`);
  };
  const searchParams = useSearchParams();
  const valueOrder = searchParams.get("o") ?? 0;
  const valueFilter = searchParams.get("f") ?? 0;
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
                b.value == valueOrder
                  ? "bg-black text-white"
                  : "bg-gray-300 text-black"
              }`}
              color={"white"}
            >
              {b.icon} {b.title}
            </Button>
          ))}
        </ButtonGroup>
      </div>
      <div className="flex items-center">
        <button
          onClick={handleClickFilterByButton}
          className="bg-gray-100 rounded-xl p-2 mr-2 cursor-pointer"
        >
          FILTER BY
        </button>
        <ButtonGroup className="rounded-xl">
          {filterButtons.map((b) => (
            <Button
              key={b.value}
              onClick={() => handleClickFilterButton(b.value)}
              className={`mr-0.5 cursor-pointer ${
                b.value == valueFilter
                  ? "bg-black text-white"
                  : "bg-gray-300 text-black"
              }`}
              color={"white"}
            >
              {b.icon} {b.title}
            </Button>
          ))}
        </ButtonGroup>
      </div>
    </div>
  );
}
