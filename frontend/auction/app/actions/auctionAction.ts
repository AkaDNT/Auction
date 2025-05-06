"use server";

import { Auction, PageResult } from "../models/Auction";

export const getData = async (query: string): Promise<PageResult<Auction>> => {
  const auctions = await fetch(
    `${process.env.API_URL}/search/?pageSize=8&${query}`
  );
  if (!auctions) throw new Error("Can't fetch data");
  return auctions.json();
};
