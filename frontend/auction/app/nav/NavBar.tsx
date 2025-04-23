"use client";
import React from "react";
import { AiOutlineCar } from "react-icons/ai";
import Search from "./Search";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-50 flex justify-between bg-white p-5 text-gray-800 shadow-md">
      <div
        className="flex items-center gap-2 text-3xl font-semibold text-red-500 cursor-pointer"
        onClick={() => router.push("/")}
      >
        <AiOutlineCar size={34}></AiOutlineCar>
        Carties Auction
      </div>
      <Search></Search>
      <div>Right</div>
    </header>
  );
}
