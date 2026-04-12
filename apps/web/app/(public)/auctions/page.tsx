import { SiteFooter } from "@/features/landing/components/site-footer";

import { AuctionsMarketFlow } from "@/features/auction/components/auctions-market-flow";
import { AuctionsNavbar } from "@/features/auction/components/auctions-navbar";
import { AuctionsNotesSection } from "@/features/auction/components/auctions-notes-section";

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
