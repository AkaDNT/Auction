/**
 * Admin FAQs Page (Redirects to /admin/content)
 * Route: /admin/content/faqs
 */

import { redirect } from "next/navigation";

export default function AdminFaqsPage() {
  redirect("/admin/content");
}
