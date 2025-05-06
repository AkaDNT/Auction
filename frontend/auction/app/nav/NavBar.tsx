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
        <AiOutlineCar size={34} />
        Carties Auction
      </div>

      <Search />

      <button
        onClick={() => router.push("/login")}
        className="px-4 py-2 border border-red-500 text-red-500 font-semibold rounded-full hover:bg-red-500 hover:text-white transition duration-200 mr-8"
      >
        Login
      </button>
    </header>
  );
}
