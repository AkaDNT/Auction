/**
 * Admin Content Management Page
 * Route: /admin/content
 * SOLID: Single Responsibility - displays content management page
 */

"use client";

import { AdminContentManager } from "@/features/admin/components";

export default function AdminContentPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Quản lý nội dung</h1>
        <p className="mt-2 text-gray-600">
          Quản lý tính năng và câu hỏi thường gặp trên nền tảng
        </p>
      </section>

      <AdminContentManager />
    </div>
  );
}
