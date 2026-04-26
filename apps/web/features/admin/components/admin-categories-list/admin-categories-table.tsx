import type { AdminCategoriesTableProps } from "./types";

export function AdminCategoriesTable({
  categories,
  isDeleting,
  onEdit,
  onDelete,
}: AdminCategoriesTableProps) {
  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-theme-line">
      <table className="min-w-full table-fixed">
        <colgroup>
          <col className="w-[24%]" />
          <col className="w-[24%]" />
          <col className="w-[32%]" />
          <col className="w-[20%]" />
        </colgroup>
        <thead className="bg-(--primary-soft)">
          <tr className="border-b border-theme-line text-xs font-semibold uppercase tracking-[0.2em] theme-muted">
            <th className="px-3 py-3 text-left">Tên hiển thị</th>
            <th className="px-3 py-3 text-left">nhãn</th>
            <th className="px-3 py-3 text-left">Mô tả</th>
            <th className="px-3 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr
              key={category.id}
              className="border-b border-theme-line transition hover:bg-(--primary-soft)/45"
            >
              <td className="px-3 py-3 align-top">
                <p className="text-sm font-semibold theme-heading">
                  {category.label}
                </p>
                <p className="mt-1 text-[11px] theme-muted">
                  ID: {category.id}
                </p>
              </td>
              <td className="px-3 py-3 align-top text-sm font-medium theme-heading">
                <span className="inline-flex rounded-lg border border-theme-line bg-(--primary-soft) px-2.5 py-1 text-xs font-semibold theme-muted">
                  {category.slug}
                </span>
              </td>
              <td className="px-3 py-3 align-top text-sm theme-muted">
                <p className="line-clamp-2" title={category.description || ""}>
                  {category.description || "Chưa có mô tả"}
                </p>
              </td>
              <td className="px-3 py-3 align-top text-right whitespace-nowrap">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(category)}
                    className="cursor-pointer inline-flex rounded-full border border-theme-line px-3 py-1.5 text-xs font-semibold theme-muted transition hover:bg-(--primary-soft)"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(category)}
                    disabled={isDeleting}
                    className="cursor-pointer inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
