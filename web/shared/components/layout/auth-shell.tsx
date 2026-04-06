import type { ReactNode } from "react";
import Image from "next/image";

import { ThemeToggle } from "@/shared/components/theme/theme-toggle";
import { mockImages } from "@/shared/lib/mock-images";

type AuthShellProps = {
  children: ReactNode;
  title: string;
  description: string;
};

export function AuthShell({ children, title, description }: AuthShellProps) {
  return (
    <div className="theme-page min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col justify-center gap-6 sm:gap-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] theme-primary">
              Sàn Đấu Giá
            </p>
            <p className="mt-2 text-sm theme-muted">{description}</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-8">
          <div className="max-w-xl">
            <span className="theme-eyebrow">Truy cập an toàn</span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight theme-heading sm:mt-5 sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 text-base leading-7 theme-muted sm:mt-5 sm:text-lg">
              Hệ thống giao diện này được giữ xuyên suốt khu vực xác thực để sản
              phẩm luôn thống nhất từ điểm vào công khai đến các khu vực vận
              hành nội bộ.
            </p>

            <div className="relative mt-6 h-48 overflow-hidden rounded-[1.5rem] border border-[color:var(--border)] sm:h-56">
              <Image
                src={mockImages.authHero}
                alt="Không gian vận hành xác thực"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
          </div>

          <div className="theme-surface rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
