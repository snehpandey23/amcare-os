import Link from "next/link";
import { REFERENCE_DOCUMENTS } from "@/content/referenceDocuments";
import {
  portalCapsLabel,
  portalCard,
  portalH1,
  portalH3,
  portalLinkBack,
  portalPage,
} from "@/lib/portal-ui";

export default function ResourcesIndexPage() {
  return (
    <div className={portalPage}>
      <header>
        <p className={portalCapsLabel}>Official sources</p>
        <h1 className={portalH1}>Reference library</h1>
        <p className="mt-3 max-w-xl leading-relaxed text-[var(--siya-text-secondary)]">
          These pages summarize authoritative HIPAA materials and link through to the publisher sites. Each module
          lesson may include &quot;Read more here&quot; shortcuts into this library.
        </p>
      </header>
      <ul className="space-y-4">
        {REFERENCE_DOCUMENTS.map((doc) => (
          <li key={doc.slug}>
            <Link
              href={`/resources/${doc.slug}`}
              className={`block transition-colors hover:border-[var(--siya-accent)]/40 ${portalCard}`}
            >
              <span className="font-medium text-[var(--siya-accent)]">Read more here</span>
              <span className={`mt-1 block text-lg ${portalH3}`}>{doc.shortLabel}</span>
              <span className="mt-0.5 block text-sm font-normal text-[var(--siya-text-secondary)]">{doc.title}</span>
              <span className="mt-2 block text-sm text-[var(--siya-text-secondary)]">{doc.summary}</span>
              <span className="mt-2 block text-xs text-[var(--siya-text-muted)]">{doc.publisher}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-center text-xs text-[var(--siya-text-muted)]">
        <Link href="/" className={portalLinkBack}>
          ← My day
        </Link>
      </p>
    </div>
  );
}
