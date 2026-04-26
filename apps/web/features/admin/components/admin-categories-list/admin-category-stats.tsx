interface AdminCategoryStatsProps {
  total: number;
  shown: number;
}

export function AdminCategoryStats({
  total,
  shown,
}: AdminCategoryStatsProps) {
  return (
    <section className="grid gap-3 grid-cols-2 items-center">
      <article className="theme-card rounded-2xl p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.2em] theme-muted">
          Tổng danh mục
        </p>
        <p className="mt-3 text-2xl font-semibold theme-heading">{total}</p>
      </article>

      <article className="theme-card rounded-2xl p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.2em] theme-muted">
          Đang xem
        </p>
        <p className="mt-3 text-2xl font-semibold theme-heading">{shown}</p>
      </article>
    </section>
  );
}
