import Image from "next/image";

import { mockImages } from "@/shared/lib/mock-images";

const settingsSections = [
  {
    title: "Thương hiệu",
    description: "Logo, màu sắc và nhận diện của sàn đấu giá",
  },
  {
    title: "Bảo mật",
    description: "Vai trò, phiên đăng nhập và chính sách MFA",
  },
  {
    title: "Thông báo",
    description: "Tùy chọn email và sự kiện trên nền tảng",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section className="theme-callout rounded-[1.75rem] p-6">
        <p className="text-sm uppercase tracking-[0.35em] theme-primary">
          Cài đặt
        </p>
        <h2 className="mt-4 text-2xl font-semibold theme-heading">
          Cấu hình nền tảng
        </h2>
        <p className="mt-3 text-sm leading-7 theme-muted">
          Các điều khiển này được trình bày như một bảng điều hành đơn giản để
          phục vụ công việc cấu hình về sau.
        </p>
        <div className="relative mt-5 h-44 overflow-hidden rounded-2xl border border-[color:var(--border)] sm:h-52">
          <Image
            src={mockImages.settingsBoard}
            alt="Cấu hình nền tảng"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {settingsSections.map((section) => (
          <article
            key={section.title}
            className="theme-card rounded-[1.5rem] p-6"
          >
            <p className="text-xl font-semibold theme-heading">
              {section.title}
            </p>
            <p className="mt-3 text-sm leading-7 theme-muted">
              {section.description}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
