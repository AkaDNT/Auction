import type { ReactNode } from "react";

import { AuctionsNavbar } from "@/features/auction/components/auctions-navbar";
import { PublicSidebar } from "@/shared/components/layout/public-sidebar";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="theme-page relative isolate min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,var(--glow),transparent_38%)]" />

      <div className="relative text-theme-body">
        <AuctionsNavbar />

        {/* <div className="flex justify-center gap-1 lg:mr-68"> */}
        {/* <div>
            <aside className="hidden lg:block lg:min-h-full lg:w-[280px] lg:overflow-y-auto">
              <PublicSidebar />
            </aside>
          </div> */}
        <div className="min-w-0">{children}</div>
      </div>
      {/* </div> */}
    </div>
  );
}
