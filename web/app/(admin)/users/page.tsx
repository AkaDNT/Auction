import Image from "next/image";

import { mockImages } from "@/shared/lib/mock-images";

const users = [
  {
    name: "Ava Nguyen",
    role: "Giám đốc sàn đấu giá",
    status: "Đang hoạt động",
  },
  {
    name: "Daniel Park",
    role: "Chiến lược sản phẩm",
    status: "Đang hoạt động",
  },
  { name: "Sophia Reed", role: "Trưởng bộ phận vận hành", status: "Chờ xử lý" },
];

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <section className="theme-callout rounded-[1.75rem] p-6">
        <p className="text-sm uppercase tracking-[0.35em] theme-primary">
          Người dùng
        </p>
        <h2 className="mt-4 text-2xl font-semibold theme-heading">
          Quản lý truy cập và định danh
        </h2>
        <p className="mt-3 text-sm leading-7 theme-muted">
          Quản lý gọn gàng đội vận hành nội bộ, người bán và người mua với phân
          vai rõ ràng.
        </p>
        <div className="relative mt-5 h-44 overflow-hidden rounded-2xl border border-[color:var(--border)] sm:h-52">
          <Image
            src={mockImages.usersBoard}
            alt="Quản lý người dùng"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </section>

      <section className="theme-card rounded-[1.75rem] p-6">
        <div className="grid gap-4">
          {users.map((user) => (
            <div
              key={user.name}
              className="flex flex-col gap-3 rounded-2xl border border-[color:var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold theme-heading">{user.name}</p>
                <p className="mt-1 text-sm theme-muted">{user.role}</p>
              </div>
              <span className="theme-eyebrow px-3 py-1 text-[0.65rem] tracking-[0.28em]">
                {user.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
