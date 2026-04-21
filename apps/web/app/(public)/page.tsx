import { BenefitsSection } from "@/features/landing/components/benefits-section";
import { CtaSection } from "@/features/landing/components/cta-section";
import { FeaturesSection } from "@/features/landing/components/features-section";
import { HeroSection } from "@/features/landing/components/hero-section";
import { HowItWorksSection } from "@/features/landing/components/how-it-works-section";
import { LogoStripSection } from "@/features/landing/components/logo-strip-section";
import { PricingSection } from "@/features/landing/components/pricing-section";
import { SiteFooter } from "@/features/landing/components/site-footer";
import { SiteHeader } from "@/features/landing/components/site-header";
import { StatsSection } from "@/features/landing/components/stats-section";
import { TeamSection } from "@/features/landing/components/team-section";
import { TestimonialsSection } from "@/features/landing/components/testimonials-section";
import { LandingPageShell } from "@/shared/components/layout/landing-page-shell";

export default function HomePage() {
  return (
    <>
      <LandingPageShell>
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <HowItWorksSection />
        <StatsSection />
        <TeamSection />
        <LogoStripSection />
        <TestimonialsSection />
        <PricingSection />
        <CtaSection />
        <SiteFooter />
      </LandingPageShell>
    </>
  );
}
