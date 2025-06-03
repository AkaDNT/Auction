import Link from "next/link";
import { getCurrentUser } from "../actions/getCurrentUser";
import Image from "next/image";
import Search from "./Search";

export default async function NavBar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 flex justify-between bg-white p-5 text-gray-800 shadow-md">
      <Link
        href="/"
        className="flex items-center gap-2 text-3xl font-semibold text-red-500"
      >
        <span className="text-3xl">🚗</span>
        Cars Auction
      </Link>

      <Search />

      <div className="flex items-center gap-6">
        {!user ? (
          <Link
            href="/login"
            className="px-4 py-2 border border-red-500 text-red-500 font-semibold rounded-full hover:bg-red-500 hover:text-white transition duration-200"
          >
            Login
          </Link>
        ) : (
          <div className="relative group">
            <div className="flex items-center gap-2 cursor-pointer">
              <Image
                src={user.imageUrl || "/default-avatar.png"}
                alt="avatar"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-medium">Welcome {user.displayName}</span>
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            <div className="absolute right-0 mt-2 w-52 bg-white border rounded shadow-md opacity-0 group-hover:opacity-100 transition z-50">
              <Link
                href="/my-auctions"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                🧑‍💼 My Auctions
              </Link>
              <Link
                href="/auctions-won"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                🏆 Auctions won
              </Link>
              <Link
                href="/auctions/create"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                🚘 Sell my car
              </Link>
              <form action="/logout" method="post">
                <button
                  type="submit"
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  🔒 Sign out
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
