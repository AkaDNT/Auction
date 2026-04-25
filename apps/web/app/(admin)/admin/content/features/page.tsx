/**
 * Admin Features Page (Redirects to /admin/content)
 * Route: /admin/content/features
 */

import { redirect } from "next/navigation";

export default function AdminFeaturesPage() {
  redirect("/admin/content");
}
