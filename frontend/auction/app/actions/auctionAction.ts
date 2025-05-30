"use server";

import { cookies } from "next/headers";
import { Auction, PageResult } from "../models/Auction";
import { FieldValues } from "react-hook-form";
import { fetchWrapper } from "@/lib/fetchWrapper";

export const getData = async (query: string): Promise<PageResult<Auction>> => {
  const auctions = await fetch(
    `${process.env.API_URL}/search/?pageSize=8&${query}`
  );
  if (!auctions) throw new Error("Can't fetch data");
  return auctions.json();
};

export const getMyAuctions = async (
  query: string
): Promise<PageResult<Auction>> => {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) throw new Error("Unauthorized");

  const auctions = await fetch(
    `${process.env.API_URL}/search/my-auctions/?pageSize=8&${query}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );
  if (!auctions) throw new Error("Can't fetch data");
  return auctions.json();
};

export const createAuction = async (data: FieldValues) => {
  return await fetchWrapper.post("/auctions", data);
};

export const getDetailedAuction = async (id: string) => {
  return await fetchWrapper.get(`/auctions/${id}`);
};
