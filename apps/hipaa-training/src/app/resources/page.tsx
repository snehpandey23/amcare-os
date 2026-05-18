import Link from "next/link";
import { REFERENCE_DOCUMENTS } from "@/content/referenceDocuments";

export default function ResourcesIndexPage() {
  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-teal-600 dark:text-teal-400">Official sources</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Reference library</h1>
        <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">
          These pages summarize authoritative HIPAA materials and link through to the publisher sites.
          Each module lesson may include &quot;Read more here&quot; shortcuts into this library.
        </p>
        <ul className="mt-8 space-y-4">
          {REFERENCE_DOCUMENTS.map((doc) => (
            <li key={doc.slug}>
              <Link
                href={`/resources/${doc.slug}`}
                className="block rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-teal-300 hover:bg-teal-50/40 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-teal-800 dark:hover:bg-teal-950/20"
              >
                <span className="font-medium text-teal-700 dark:text-teal-400">Read more here</span>
                <span className="mt-1 block text-lg font-semibold text-zinc-900 dark:text-zinc-100">{doc.shortLabel}</span>
                <span className="mt-0.5 block text-sm font-normal text-zinc-600 dark:text-zinc-400">{doc.title}</span>
                <span className="mt-2 block text-sm text-zinc-600 dark:text-zinc-400">{doc.summary}</span>
                <span className="mt-2 block text-xs text-zinc-500">{doc.publisher}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
