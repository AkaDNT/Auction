import type { Metadata } from "next";
import { SiteFooter } from "@/features/landing/components/site-footer";

import { AuctionsMarketFlow } from "@/features/auction/components/auctions-market-flow";
import { AuctionsNavbar } from "@/features/auction/components/auctions-navbar";
import { AuctionsNotesSection } from "@/features/auction/components/auctions-notes-section";

const pageTitle = "Phiên đấu giá đang mở | Vinabid Store";
const pageDescription =
  "Khám phá các phiên đấu giá trực tuyến đang mở, theo dõi giá hiện tại theo thời gian thực và tham gia đặt giá minh bạch trên Vinabid Store.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/auctions",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/auctions",
    type: "website",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
  },
};

export default function AuctionsPage() {
  return (
    <>
      <AuctionsNavbar />
      <AuctionsMarketFlow />
      <AuctionsNotesSection />
      <SiteFooter />
    </>
  );
}
