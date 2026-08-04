import Link from "next/link";
import { notFound } from "next/navigation";
import { getReferenceDocument, listReferenceSlugs } from "@/content/referenceDocuments";
import { portalBtnAccent, portalBtnGhostSm, portalCapsLabel, portalH1, portalLinkBack, portalPage } from "@/lib/portal-ui";

export function generateStaticParams() {
  return listReferenceSlugs().map((slug) => ({ slug }));
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getReferenceDocument(slug);
  if (!doc) notFound();

  return (
    <div className={portalPage}>
      <p className={portalCapsLabel}>{doc.publisher}</p>
      <h1 className={`mt-2 ${portalH1}`}>{doc.title}</h1>
      <p className="mt-4 leading-relaxed text-[var(--siya-text-secondary)]">{doc.summary}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a href={doc.officialUrl} target="_blank" rel="noopener noreferrer" className={portalBtnAccent}>
          Open official document (new tab)
        </a>
        <Link href="/resources" className={portalBtnGhostSm}>
          All references
        </Link>
        <Link href="/" className={portalBtnGhostSm}>
          Dashboard
        </Link>
      </div>

      <p className="mt-8 text-xs text-[var(--siya-text-muted)]">
        URL:{" "}
        <a
          href={doc.officialUrl}
          className="break-all text-[var(--siya-accent)] underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {doc.officialUrl}
        </a>
      </p>
      <p className="mt-6 text-center text-xs">
        <Link href="/resources" className={portalLinkBack}>
          ← Reference library
        </Link>
      </p>
    </div>
  );
}
