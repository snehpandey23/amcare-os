"use client";

import Link from "next/link";
import status from "@/data/trust-status.json";

export default function TrustDashboardPage() {
  const s = status as {
    generatedAt: string;
    release: { label: string; version: string; level: number; deploymentDecision: string };
    scores: {
      knowledgeArchitecture: number;
      knowledgeContent: number;
      criticalFailures: number;
      phiTestsPercent: number;
      unsafeClinical: number;
      missingOwners: number;
      expiredDocuments: number;
      knowledgeGaps: number;
      redTeam: string;
      redTeamPass: boolean;
      phiPass: boolean;
      liveTopics: number;
    };
    deployment: { blocked: boolean; reasons: string[] };
    checklist: Record<string, boolean>;
  };

  const sc = s.scores;
  const pilotEmoji = s.deployment.blocked ? "🔴 Blocked" : "🟡 Internal Pilot";

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-8 md:px-6">
      <header>
        <Link href="/" className="text-sm text-[var(--siya-accent)] hover:underline">
          ← Home
        </Link>
        <h1 className="mt-3 font-[family-name:var(--font-poppins)] text-2xl font-semibold text-[var(--siya-primary)]">
          Siya Assistant — Trust
        </h1>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          {s.release.label} · v{s.release.version} · Level {s.release.level} · Updated{' '}
          {new Date(s.generatedAt).toLocaleString()}
        </p>
      </header>

      <div className="rounded-2xl border border-[var(--siya-border)] bg-white p-5 shadow-[var(--siya-shadow)]">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <Metric label="Knowledge architecture" value={String(sc.knowledgeArchitecture)} />
          <Metric label="Knowledge content" value={String(sc.knowledgeContent)} />
          <Metric label="Critical failures" value={String(sc.criticalFailures)} />
          <Metric label="PHI tests" value={`${sc.phiTestsPercent}%`} warn={!sc.phiPass} />
          <Metric label="Unsafe clinical" value={String(sc.unsafeClinical)} />
          <Metric label="Missing owners" value={String(sc.missingOwners)} warn={sc.missingOwners > 0} />
          <Metric label="Expired documents" value={String(sc.expiredDocuments)} warn={sc.expiredDocuments > 0} />
          <Metric label="Knowledge gaps (est.)" value={String(sc.knowledgeGaps)} />
          <Metric label="Live topics" value={String(sc.liveTopics)} />
          <Metric label="Red team" value={sc.redTeamPass ? 'PASS' : sc.redTeam} warn={!sc.redTeamPass} />
        </dl>
        <p className="mt-4 border-t border-[var(--siya-border)] pt-4 text-center font-semibold text-[var(--siya-primary)]">
          Deployment — {pilotEmoji}
        </p>
        {s.deployment.reasons.length ? (
          <ul className="mt-2 list-inside list-disc text-xs text-[var(--siya-text-muted)]">
            {s.deployment.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <section className="rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] p-4 text-xs">
        <h2 className="font-semibold text-[var(--siya-primary)]">Release checklist (manual)</h2>
        <ul className="mt-2 space-y-1 text-[var(--siya-text-secondary)]">
          {Object.entries(s.checklist).map(([k, v]) => (
            <li key={k}>
              {v ? '☑' : '☐'} {k.replace(/([A-Z])/g, ' $1').trim()}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[var(--siya-text-muted)]">
          Full gate: <code className="text-[10px]">npm run gate:deploy -w @amcare/hipaa-training</code>
        </p>
      </section>
    </div>
  );
}

function Metric({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <>
      <dt className="text-[var(--siya-text-muted)]">{label}</dt>
      <dd className={`font-medium ${warn ? 'text-amber-800' : 'text-[var(--siya-text-secondary)]'}`}>{value}</dd>
    </>
  );
}
