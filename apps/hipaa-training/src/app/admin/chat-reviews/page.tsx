import { AdminChatReviewsPanel } from "@/components/ops/AdminChatReviewsPanel";
import { PortalNavLink } from "@/components/training/PortalNavLink";
import { portalH1, portalLinkBack, portalPage } from "@/lib/portal-ui";

export default function AdminChatReviewsPage() {
  return (
    <div className={portalPage}>
      <header className="mb-2">
        <PortalNavLink href="/admin/team" className={portalLinkBack}>
          ← Admin
        </PortalNavLink>
        <h1 className={`mt-2 ${portalH1}`}>Chat reviews — team view</h1>
      </header>
      <AdminChatReviewsPanel />
    </div>
  );
}
