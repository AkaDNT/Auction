"use server";

import { handleResponse } from "@/lib/fetchWrapper";

export async function signupUser(prevState: unknown, formData: FormData) {
  const res = await fetch(`${process.env.API_URL}/account/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: formData.get("email"),
      displayName: formData.get("displayName"),
      password: formData.get("password"),
    }),
  });

  if (!res.ok) {
    const data = await handleResponse(res);
    return { success: false, message: data.error };
  }

  return { success: true };
}
