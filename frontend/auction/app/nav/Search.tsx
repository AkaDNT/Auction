"use client";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import { useState, FormEvent } from "react";

export default function Search() {
  const [input, setInput] = useState("");
  const router = useRouter();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    // push sẽ thêm ?search=xxx vào URL và reload component
    router.push(`?search=${encodeURIComponent(input.trim())}`);
  };
  return (
    <form
      onSubmit={submit}
      className="flex w-[50%] items-center border-2 rounded-full py-2 shadow-sm"
    >
      <input
        type="text"
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search for cars"
        className="flex-grow pl-5 bg-transparent focus:outline-none border-transparent focus:border-transparent focus:ring-0 text-sm text-gray-600"
      ></input>
      <button type="submit">
        <FaSearch
          size={34}
          className="bg-red-400 text-white rounded-full p-2 cursor-pointer mx-2"
        ></FaSearch>
      </button>
    </form>
  );
}
