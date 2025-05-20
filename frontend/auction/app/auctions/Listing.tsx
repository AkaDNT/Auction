"use client";
import React, { useEffect, useState } from "react";
import AuctionCard from "./AuctionCard";
import { Auction } from "../models/Auction";
import AppPagination from "../components/AppPagination";
import { getData, getMyAuctions } from "../actions/auctionAction";
import { usePathname, useSearchParams } from "next/navigation";

export default function Listing() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") ?? "";
  const sortTerm = searchParams.get("o") ?? 0;
  const filterTerm = searchParams.get("f") ?? 0;
  const pathname = usePathname();
  const route = pathname.split("/")[1];
  const query = `pageNumber=${currentPage}&searchTerm=${encodeURIComponent(
    searchTerm
  )}&sort=${encodeURIComponent(sortTerm)}&filter=${encodeURIComponent(
    filterTerm
  )}`;

  console.log(route == "my-auctions");

  useEffect(() => {
    if (route == "my-auctions") {
      getMyAuctions(query).then((data) => {
        setAuctions(data.results);
        setPageCount(data.pageCount);
      });
    } else
      getData(query).then((data) => {
        setAuctions(data.results);
        setPageCount(data.pageCount);
      });
  }, [query, route]);

  return (
    <div className="grid-rows-3">
      <div className="grid grid-cols-4 gap-6">
        {auctions &&
          auctions.map((auc: Auction) => (
            <AuctionCard auction={auc} key={auc.id}></AuctionCard>
          ))}
      </div>
      <AppPagination
        currentPage={currentPage}
        pageCount={pageCount}
        pageChanged={setCurrentPage}
      ></AppPagination>
    </div>
  );
}
