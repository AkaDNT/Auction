"use server";

import { cookies } from "next/headers";

export interface CurrentUser {
  displayName: string;
  email: string;
  imageUrl: string;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) return null;

  const res = await fetch(`${process.env.API_URL}/account/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = await res.json();

  return {
    displayName: data.displayName,
    email: data.email,
    imageUrl: data.imageUrl,
  };
}
