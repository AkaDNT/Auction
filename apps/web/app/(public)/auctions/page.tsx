import { SiteFooter } from "@/features/landing/components/site-footer";

import { AuctionsMarketFlow } from "@/features/auction/components/auctions-market-flow";
import { AuctionsNavbar } from "@/features/auction/components/auctions-navbar";
import { AuctionsNotesSection } from "@/features/auction/components/auctions-notes-section";

export default function AuctionsPage() {
  return (
    <main className="theme-page relative isolate min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--glow),_transparent_38%)]" />
      <div className="relative">
        <AuctionsNavbar />
        <AuctionsMarketFlow />
        <AuctionsNotesSection />
        <SiteFooter />
      </div>
    </main>
  );
}
