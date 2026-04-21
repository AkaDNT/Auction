import type { Metadata } from "next";
import { Be_Vietnam_Pro, Noto_Sans_Mono } from "next/font/google";
import { AuthSessionBootstrap } from "@/features/auth/components/auth-session-bootstrap";
import { QueryProvider } from "@/shared/components/query/query-provider";
import { ThemeProvider } from "@/shared/components/theme/theme-provider";
import { ThemeScript } from "@/shared/components/theme/theme-script";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const notoSansMono = Noto_Sans_Mono({
  variable: "--font-noto-sans-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().match(/^https?:\/\//)
    ? process.env.NEXT_PUBLIC_SITE_URL.trim()
    : "https://example.com";

export const metadata: Metadata = {
  title: "Sàn Đấu Giá | Nền tảng đấu giá doanh nghiệp",
  description:
    "Giao diện Next.js cao cấp cho một sàn đấu giá quy mô doanh nghiệp.",
  metadataBase: new URL(siteUrl),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${beVietnamPro.variable} ${notoSansMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
        <ThemeScript />
        <QueryProvider>
          <ThemeProvider>
            <AuthSessionBootstrap />
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
