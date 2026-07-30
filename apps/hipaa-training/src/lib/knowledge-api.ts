import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";
import type { ConstitutionEntry, DecisionRecord, PolicyRequirement } from "@/lib/knowledge-types";

async function knowledgeFetch(path: string, init?: RequestInit) {
  const base = getTrainingApiUrl();
  const token = getStoredToken();
  if (!base || !token) throw new Error("Sign in required.");
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export async function fetchConstitution(): Promise<ConstitutionEntry[]> {
  const data = (await knowledgeFetch("/api/knowledge/constitution")) as { entries: ConstitutionEntry[] };
  return data.entries ?? [];
}

export async function fetchPoliciesRequirements(): Promise<PolicyRequirement[]> {
  const data = (await knowledgeFetch("/api/policies/requirements")) as {
    policies: PolicyRequirement[];
  };
  return data.policies ?? [];
}

export async function fetchDecisions(limit = 30): Promise<DecisionRecord[]> {
  const data = (await knowledgeFetch(`/api/knowledge/decisions?limit=${limit}`)) as {
    decisions: DecisionRecord[];
  };
  return data.decisions ?? [];
}

export async function createDecision(payload: {
  title: string;
  decisionText: string;
  reason?: string;
  whatChanged?: string;
  actionHook?: string;
  ownerName?: string;
  department?: string;
  decisionDate?: string;
  importance?: number;
  confidence?: number;
  status?: string;
  supersedesId?: string;
  parentConstitutionId?: string;
  halfLifeDays?: number | null;
  relatedIds?: string[];
  evidence?: string;
}): Promise<DecisionRecord> {
  const data = (await knowledgeFetch("/api/knowledge/decisions", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as { decision: DecisionRecord };
  return data.decision;
}

export async function fetchDecisionLineage(id: string): Promise<{
  current: DecisionRecord;
  supersededChain: DecisionRecord[];
  relatedPrinciples: { id: string; title: string }[];
}> {
  return (await knowledgeFetch(`/api/knowledge/decisions/${id}/lineage`)) as {
    current: DecisionRecord;
    supersededChain: DecisionRecord[];
    relatedPrinciples: { id: string; title: string }[];
  };
}

export async function fetchDecision(id: string): Promise<{ decision: DecisionRecord; links: unknown[] }> {
  return (await knowledgeFetch(`/api/knowledge/decisions/${id}`)) as {
    decision: DecisionRecord;
    links: unknown[];
  };
}
