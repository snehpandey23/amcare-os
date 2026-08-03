import { AdminChatReviewsPanel } from "@/components/ops/AdminChatReviewsPanel";
import { PortalNavLink } from "@/components/training/PortalNavLink";

export default function AdminChatReviewsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <header className="mb-6">
        <PortalNavLink href="/admin/tasks" className="text-sm text-[var(--siya-accent)] hover:underline">
          ← Admin
        </PortalNavLink>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--siya-primary)]">Chat reviews — team view</h1>
      </header>
      <AdminChatReviewsPanel />
    </div>
  );
}
