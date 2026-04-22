import type { MetadataRoute } from "next";

import {
  listAuctionCategories,
  listAuctions,
} from "@/features/auction/services/list-auctions";
import {
  auctionCategories,
  liveAuctions,
} from "@/features/auction/mocks/auctions.mock";
import type {
  AuctionApiCategory,
  AuctionApiItem,
} from "@/features/auction/types/auction-api";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().match(/^https?:\/\//)
  ? process.env.NEXT_PUBLIC_SITE_URL.trim()
  : "https://example.com";

function toAbsoluteUrl(pathname: string) {
  return new URL(pathname, siteUrl).toString();
}

function toLastModified(value: string | undefined) {
  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

async function loadSitemapSources() {
  try {
    const [categoriesResponse, liveResponse, upcomingResponse, endedResponse] =
      await Promise.all([
        listAuctionCategories(),
        listAuctions({ limit: 200, status: "LIVE" }),
        listAuctions({ limit: 200, status: "UPCOMING" }),
        listAuctions({ limit: 200, status: "ENDED" }),
      ]);

    const categories = categoriesResponse;
    const auctions = [
      ...liveResponse.items,
      ...upcomingResponse.items,
      ...endedResponse.items,
    ];

    const uniqueAuctionsMap = new Map<string, AuctionApiItem>();
    auctions.forEach((auction) => {
      uniqueAuctionsMap.set(auction.id, auction);
    });

    return {
      categories,
      auctions: [...uniqueAuctionsMap.values()],
    };
  } catch {
    return {
      categories: auctionCategories.map<AuctionApiCategory>((category) => ({
        id: category.slug,
        slug: category.slug,
        label: category.label,
      })),
      auctions: [],
    };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { categories, auctions } = await loadSitemapSources();

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

  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: toAbsoluteUrl(`/auctions/category/${category.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const fallbackAuctionUrls: MetadataRoute.Sitemap = liveAuctions.map(
    (auction) => ({
      url: toAbsoluteUrl(`/auctions/${auction.id}`),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8,
    }),
  );

  const auctionUrls: MetadataRoute.Sitemap =
    auctions.length > 0
      ? auctions
          .filter((auction) => auction.status !== "CANCELLED")
          .map((auction) => ({
            url: toAbsoluteUrl(`/auctions/${auction.id}`),
            lastModified: toLastModified(auction.endAt),
            changeFrequency:
              auction.status === "LIVE" ? "hourly" : ("daily" as const),
            priority: auction.status === "LIVE" ? 0.9 : 0.75,
          }))
      : fallbackAuctionUrls;

  return [...staticUrls, ...categoryUrls, ...auctionUrls];
}
