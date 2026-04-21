import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().match(/^https?:\/\//)
    ? process.env.NEXT_PUBLIC_SITE_URL.trim()
    : "https://example.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/lots",
        "/users",
        "/settings",
        "/seller",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/profile",
      ],
    },
    sitemap: [`${siteUrl}/sitemap.xml`],
    host: siteUrl,
  };
}
