import { BenefitsSection } from "@/features/landing/components/benefits-section";
import { CtaSection } from "@/features/landing/components/cta-section";
import { FeaturesSection } from "@/features/landing/components/features-section";
import { HeroSection } from "@/features/landing/components/hero-section";
import type { Metadata } from "next";
import { HowItWorksSection } from "@/features/landing/components/how-it-works-section";
import { LogoStripSection } from "@/features/landing/components/logo-strip-section";
import { PricingSection } from "@/features/landing/components/pricing-section";
import { SiteFooter } from "@/features/landing/components/site-footer";
import { StatsSection } from "@/features/landing/components/stats-section";
import { TeamSection } from "@/features/landing/components/team-section";
import { TestimonialsSection } from "@/features/landing/components/testimonials-section";
import { LandingPageShell } from "@/shared/components/layout/landing-page-shell";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().match(/^https?:\/\//)
  ? process.env.NEXT_PUBLIC_SITE_URL.trim()
  : "https://example.com";

const pageTitle =
  "Sàn đấu giá trực tuyến doanh nghiệp | Đấu giá minh bạch theo thời gian thực";
const pageDescription =
  "Nền tảng sàn đấu giá trực tuyến cho doanh nghiệp: quản lý phiên đấu giá realtime, đặt giá minh bạch, theo dõi lịch sử bid và tối ưu quy trình mua bán tài sản giá trị cao.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "sàn đấu giá trực tuyến",
    "đấu giá doanh nghiệp",
    "đấu giá realtime",
    "nền tảng đấu giá",
    "mua bán tài sản cao cấp",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: siteUrl,
    siteName: "Sàn Đấu Giá",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Sàn Đấu Giá",
      url: siteUrl,
      description: pageDescription,
    },
    {
      "@type": "WebSite",
      name: "Sàn Đấu Giá",
      url: siteUrl,
      inLanguage: "vi-VN",
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/auctions?keyword={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Làm sao để tham gia đấu giá trên nền tảng?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Bạn tạo tài khoản, xác thực thông tin và vào trang phiên đấu giá để đặt giá theo thời gian thực.",
          },
        },
        {
          "@type": "Question",
          name: "Nền tảng có minh bạch lịch sử đấu giá không?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Mỗi phiên đều hiển thị trạng thái, giá hiện tại và lịch sử đặt giá để người dùng theo dõi rõ ràng trước khi quyết định.",
          },
        },
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LandingPageShell>
        <HeroSection />
        <section className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
          <h2 className="text-2xl font-semibold text-theme-heading sm:text-3xl">
            Khám phá đấu giá trực tuyến theo nhu cầu
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-theme-muted sm:text-base">
            Vinabid Store cung cấp nền tảng đấu giá trực tuyến cho doanh nghiệp
            và cá nhân, tập trung vào trải nghiệm đặt giá minh bạch, theo dõi
            thời gian thực và quản trị lô hàng hiệu quả.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link href="/auctions" className="btn-secondary">
              Phiên đấu giá trực tuyến đang mở
            </Link>
            <Link href="/auctions/category/xe-dien" className="btn-secondary">
              Đấu giá xe điện
            </Link>
            <Link
              href="/auctions/category/dong-ho-cao-cap"
              className="btn-secondary"
            >
              Đấu giá đồng hồ cao cấp
            </Link>
            <Link
              href="/auctions/category/nghe-thuat-suu-tam"
              className="btn-secondary"
            >
              Đấu giá nghệ thuật sưu tầm
            </Link>
          </div>
        </section>
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
