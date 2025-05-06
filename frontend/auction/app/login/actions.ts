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
  console.log(res);

  if (!res.ok) {
    return { success: false, message: "Invalid credentials" };
  }

  const { accessToken, refreshToken } = await res.json();

  (await cookies()).set("accessToken", accessToken, { httpOnly: false });
  (await cookies()).set("refreshToken", refreshToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  return { success: true };
}
