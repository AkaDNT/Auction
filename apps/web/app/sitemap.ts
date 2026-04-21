import type { MetadataRoute } from "next";

import {
  auctionCategories,
  liveAuctions,
} from "@/features/auction/mocks/auctions.mock";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().match(/^https?:\/\//)
    ? process.env.NEXT_PUBLIC_SITE_URL.trim()
    : "https://example.com";

function toAbsoluteUrl(pathname: string) {
  return new URL(pathname, siteUrl).toString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: toAbsoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: toAbsoluteUrl("/auctions"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const categoryUrls: MetadataRoute.Sitemap = auctionCategories.map(
    (category) => ({
      url: toAbsoluteUrl(`/auctions/category/${category.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );

  const auctionUrls: MetadataRoute.Sitemap = liveAuctions.flatMap((auction) => {
    const detailEntry: MetadataRoute.Sitemap[number] = {
      url: toAbsoluteUrl(`/auctions/${auction.id}`),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8,
    };

    const liveEntry: MetadataRoute.Sitemap[number] = {
      url: toAbsoluteUrl(`/auctions/${auction.id}/live`),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.6,
    };

    return [detailEntry, liveEntry];
  });

  return [...staticUrls, ...categoryUrls, ...auctionUrls];
}
