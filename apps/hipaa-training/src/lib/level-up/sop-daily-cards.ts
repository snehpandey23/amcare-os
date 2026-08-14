import { dailyIndex, healthTermOfTheDay, phraseOfTheDay, type PhraseCard } from "@/lib/level-up/catalog";
import type { DepartmentId } from "@/lib/portal-profile";
import { DEPARTMENTS } from "@/lib/portal-profile";

export type SopRetrievalRow = {
  id: string;
  title: string;
  body: string;
  keywords: string[];
  status: string;
  department: string;
};

const PORTAL_TO_SOP_DEPTS: Record<DepartmentId | "", string[]> = {
  clinical: ["Clinical Operations"],
  marketing: ["Marketing"],
  accounts: ["Accounts"],
  hr: ["HR"],
  operations: ["Clinical Operations", "General"],
  leadership: ["Leadership", "General"],
  "": ["General"],
};

export function sopDepartmentsForUser(profileDept: DepartmentId | "", leadDepartments: string[]): string[] {
  const fromProfile = PORTAL_TO_SOP_DEPTS[profileDept] ?? ["General"];
  const set = new Set<string>([...fromProfile, ...leadDepartments]);
  return [...set];
}

export function filterLiveSopsForDepartments(sops: SopRetrievalRow[], departments: string[]): SopRetrievalRow[] {
  const deptSet = new Set(departments);
  return sops.filter((s) => s.status === "live" && deptSet.has(s.department));
}

function stripHtmlish(text: string): string {
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function excerpt(body: string, max = 220): string {
  const plain = stripHtmlish(body);
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trim()}…`;
}

function firstSentence(body: string): string {
  const plain = stripHtmlish(body);
  const m = plain.match(/^[^.!?]+[.!?]/);
  return m ? m[0].trim() : plain.slice(0, 160);
}

function sopPhraseCandidates(sop: SopRetrievalRow): PhraseCard[] {
  const out: PhraseCard[] = [];
  const base = excerpt(sop.body, 120);
  for (const kw of sop.keywords.slice(0, 4)) {
    const phrase = kw.trim();
    if (!phrase) continue;
    out.push({
      id: `${sop.id}-kw-${phrase}`,
      phrase,
      meaning: `From ${sop.department} SOP: ${sop.title}`,
      example: base || `See live SOP in workspace.`,
    });
  }
  if (!out.length && sop.title) {
    out.push({
      id: `${sop.id}-title`,
      phrase: sop.title,
      meaning: `${sop.department} team procedure`,
      example: firstSentence(sop.body) || "Open the SOP under Memory → Knowledge → Department SOPs for full steps.",
    });
  }
  return out;
}

function sopTermFromSop(sop: SopRetrievalRow): { term: string; plain: string; source: string } {
  const kw = sop.keywords.find((k) => k.trim().length > 0);
  const term = kw?.trim() ?? sop.title;
  return {
    term,
    plain: firstSentence(sop.body) || excerpt(sop.body, 200),
    source: `${sop.department} · ${sop.title}`,
  };
}

export function resolveDailyPhraseCard(
  sops: SopRetrievalRow[],
  departments: string[],
  date = new Date(),
): PhraseCard & { source?: string } {
  const live = filterLiveSopsForDepartments(sops, departments);
  const pool: PhraseCard[] = [];
  for (const sop of live) pool.push(...sopPhraseCandidates(sop));
  if (pool.length) {
    const card = pool[dailyIndex("sop-phrase-pool", pool.length, date)]!;
    return { ...card, source: card.meaning };
  }
  const slang = phraseOfTheDay(date);
  return {
    ...slang,
    source: "American workplace slang (no live SOP phrase for your department yet)",
  };
}

export function resolveDailyHealthTerm(
  sops: SopRetrievalRow[],
  departments: string[],
  date = new Date(),
): { term: string; plain: string; source?: string } {
  const live = filterLiveSopsForDepartments(sops, departments);
  if (live.length) {
    const sop = live[dailyIndex("sop-term", live.length, date)]!;
    const t = sopTermFromSop(sop);
    return { term: t.term, plain: t.plain, source: t.source };
  }
  const fallback = healthTermOfTheDay(date);
  return {
    term: fallback.term,
    plain: fallback.plain,
    source: "General telehealth vocabulary",
  };
}

export function profileDepartmentLabel(deptId: DepartmentId | ""): string | null {
  return DEPARTMENTS.find((d) => d.id === deptId)?.label ?? null;
}
