"use client";
import React from "react";
import { AiOutlineCar } from "react-icons/ai";
import Search from "./Search";
import Link from "next/link";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 flex justify-between bg-white p-5 text-gray-800 shadow-md">
      <Link
        href={"/"}
        className="flex items-center gap-2 text-3xl font-semibold text-red-500 cursor-pointer"
        onClick={window.location.reload}
      >
        <AiOutlineCar size={34}></AiOutlineCar>
        Carties Auction
      </Link>
      <Search></Search>
      <div>Right</div>
    </header>
  );
}
