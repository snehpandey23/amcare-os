/**
 * Department leads for Ask — from siya_department_leads via auth API.
 */
import { getTrainingApiUrl } from "@/lib/trainingConfig";

export type DepartmentLeadRow = {
  department: string;
  departmentSlug: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
};

const LEAD_ALIASES: { re: RegExp; slugHints: string[]; label: string }[] = [
  { re: /\b(hr|people|human\s+resources)\b/i, slugHints: ["hr"], label: "HR" },
  {
    re: /\b(clinical|clinical\s+ops|clinical\s+operations|clinical\s+program)\b/i,
    slugHints: ["clinical_operations"],
    label: "Clinical Operations",
  },
  { re: /\b(billing|accounts|finance)\b/i, slugHints: ["accounts", "finance"], label: "Accounts" },
  {
    re: /\b(compliance|privacy)\b/i,
    slugHints: ["compliance"],
    label: "Compliance",
  },
  {
    re: /\b(it|technology|tech|engineering)\b/i,
    slugHints: ["technology"],
    label: "Technology",
  },
  { re: /\b(marketing|cmo)\b/i, slugHints: ["marketing"], label: "Marketing" },
];

export function isDepartmentLeadQuery(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  if (
    /\bwho\s+(is|are)\s+(the\s+)?(hr|people|clinical|billing|accounts|compliance|it|technology|marketing)\s+(lead|leads|manager|managers|head|director)\b/.test(
      t,
    )
  ) {
    return true;
  }
  if (
    /\b(hr|people|clinical|billing|accounts|compliance|it|technology|marketing)\s+(lead|manager|head|director)\b/.test(
      t,
    ) &&
    /\b(who|name|contact|which)\b/.test(t)
  ) {
    return true;
  }
  if (/\bwho\s+(is|are)\s+(our|the)\s+(department\s+)?leads?\b/.test(t)) return true;
  if (/\blist\s+(the\s+)?(department\s+)?leads?\b/.test(t)) return true;
  return false;
}

/** Follow-up after a leads answer — stay on people/leads path. */
export function isDepartmentLeadFollowUp(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  return (
    /\b(don'?t|dont|do\s+not)\s+(you|u)\s+(already\s+)?(have|know)\b/.test(t) ||
    /\balready\s+have\s+(that|the|leads?|info|information)\b/.test(t) ||
    /\b(leads?\s+info|that\s+info|this\s+info)\b/.test(t) ||
    /\b(in\s+the\s+system|in\s+(your|the)\s+(data|db|database|portal))\b/.test(t) ||
    /\byou\s+(should\s+)?(know|have)\s+(who|the\s+leads?)\b/.test(t)
  );
}

export async function fetchDepartmentLeads(authToken: string | null): Promise<DepartmentLeadRow[]> {
  const base = getTrainingApiUrl();
  const token = authToken?.trim();
  if (!base || !token) return [];
  try {
    const res = await fetch(`${base}/api/knowledge/sops/context`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { departmentLeads?: DepartmentLeadRow[] };
    return data.departmentLeads ?? [];
  } catch {
    return [];
  }
}

function displayName(lead: DepartmentLeadRow): string {
  const name = lead.userName?.trim();
  if (name) return name;
  const email = lead.userEmail?.trim();
  if (email) return email.split("@")[0] || email;
  return "Assigned (name not on file)";
}

export function formatDepartmentLeadAnswer(
  userMessage: string,
  leads: DepartmentLeadRow[],
): { message: string; departmentLabel: string } {
  const t = userMessage.toLowerCase();
  const matched = LEAD_ALIASES.filter((a) => a.re.test(t));

  if (!matched.length || /\b(all|every|list)\b.*\bleads?\b/.test(t) || /\bwho\s+are\s+(the\s+)?(department\s+)?leads?\b/.test(t)) {
    const lines = leads.map((l) => {
      if (!l.userId) return `• **${l.department}** — no lead assigned yet`;
      return `• **${l.department}** — ${displayName(l)}`;
    });
    return {
      departmentLabel: "General",
      message: [
        "Here’s who is assigned as **department lead** in the staff portal right now:",
        "",
        ...(lines.length ? lines : ["• No department lead rows found yet."]),
        "",
        "This comes from **Team admin → department leads**, not a published org-chart guide. Assignments can change — confirm with your supervisor if unsure.",
      ].join("\n"),
    };
  }

  const parts: string[] = [];
  let departmentLabel = "HR";
  for (const alias of matched) {
    departmentLabel = alias.label;
    const rows = leads.filter((l) =>
      alias.slugHints.some((h) => l.departmentSlug === h || l.department.toLowerCase().includes(alias.label.toLowerCase().split(" ")[0]!)),
    );
    // Also match by department name contains
    const byName = leads.filter((l) =>
      alias.slugHints.some(
        (h) =>
          l.departmentSlug === h ||
          l.departmentSlug.includes(h) ||
          new RegExp(alias.label.split(" ")[0]!, "i").test(l.department),
      ),
    );
    const hit = (rows.length ? rows : byName)[0];
    if (!hit || !hit.userId) {
      parts.push(
        `**${alias.label}** — no lead assigned yet in the staff portal. Ask your supervisor or an admin to assign one under **Team → department leads**.`,
      );
    } else {
      parts.push(
        `**${alias.label} lead** right now: **${displayName(hit)}**${hit.userEmail ? ` (${hit.userEmail})` : ""}.`,
      );
    }
  }

  return {
    departmentLabel,
    message: [
      ...parts,
      "",
      "Source: live **department leads** assignment in the portal — not a static handbook. If this looks wrong, ask an admin to update the assignment.",
    ].join("\n"),
  };
}

export function formatLeadsFollowUpAnswer(leads: DepartmentLeadRow[]): string {
  const assigned = leads.filter((l) => l.userId);
  const unassigned = leads.filter((l) => !l.userId);
  return [
    "Yes — when a lead is assigned in the portal, I can name them from that list.",
    "",
    assigned.length
      ? `Currently assigned: ${assigned.map((l) => `${l.department} → ${displayName(l)}`).join("; ")}.`
      : "No department leads are assigned right now.",
    unassigned.length
      ? `Not assigned yet: ${unassigned.map((l) => l.department).join(", ")}.`
      : "",
    "",
    "I still won’t invent names that aren’t in **department leads**. If someone is missing, an admin can set them on **Team**.",
  ]
    .filter(Boolean)
    .join("\n");
}
