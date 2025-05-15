import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function POST() {
  (await cookies()).set("accessToken", "", {
    maxAge: 0,
    path: "/",
  });

  (await cookies()).set("refreshToken", "", {
    maxAge: 0,
    path: "/",
  });

  redirect("/");
}
