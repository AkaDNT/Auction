"use server";

import { cookies } from "next/headers";

export async function loginUser(prevState: unknown, formData: FormData) {
  const res = await fetch(`${process.env.API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: formData.get("email"),
      password: formData.get("password"),
    }),
  });

  if (!res.ok) {
    return { success: false, message: "Invalid credentials" };
  }

  const { accessToken, refreshToken } = await res.json();

  const cookieStore = cookies();

  (await cookieStore).set("accessToken", accessToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 1, // 1 giờ (tùy chọn)
  });

  (await cookieStore).set("refreshToken", refreshToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 ngày (tùy chọn)
  });

  return { success: true };
}
