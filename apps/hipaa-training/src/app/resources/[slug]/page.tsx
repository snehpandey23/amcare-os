import Link from "next/link";
import { notFound } from "next/navigation";
import { getReferenceDocument, listReferenceSlugs } from "@/content/referenceDocuments";

export function generateStaticParams() {
  return listReferenceSlugs().map((slug) => ({ slug }));
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getReferenceDocument(slug);
  if (!doc) notFound();

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-zinc-500">{doc.publisher}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{doc.title}</h1>
        <p className="mt-4 leading-relaxed text-zinc-600 dark:text-zinc-400">{doc.summary}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={doc.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Open official document (new tab)
          </a>
          <Link href="/resources" className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600">
            All references
          </Link>
          <Link href="/" className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600">
            Dashboard
          </Link>
        </div>

        <p className="mt-8 text-xs text-zinc-500">
          URL:{" "}
          <a href={doc.officialUrl} className="break-all text-teal-600 underline dark:text-teal-400" target="_blank" rel="noopener noreferrer">
            {doc.officialUrl}
          </a>
        </p>
      </div>
    </div>
  );
}
