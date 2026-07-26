import type { Department } from "./departments";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export function buildEscalationSummary(opts: {
  department: Department;
  task: string;
  issue: string;
  collected: Record<string, string>;
  reason: string;
  escalateTo: string;
}): string {
  const lines = [
    `Escalated to: ${opts.escalateTo}`,
    "",
    "Issue:",
    opts.issue,
    "",
    "Details collected:",
    ...Object.entries(opts.collected).map(([k, v]) => `- ${k}: ${v || "—"}`),
    "",
    "Routing:",
    `- Department: ${opts.department}`,
    `- Task: ${opts.task}`,
    "",
    "Reason for escalation:",
    opts.reason,
  ];
  return lines.join("\n");
}

/** Pull user answers from recent turns (simple: last user messages after first). */
export function collectFromHistory(history: ChatTurn[], labels: string[]): Record<string, string> {
  const users = history.filter((t) => t.role === "user").map((t) => t.content);
  const out: Record<string, string> = {};
  labels.forEach((label, i) => {
    out[label] = users[i + 1] ?? "";
  });
  return out;
}

export function defaultEscalationOwner(department: Department): string {
  const map: Record<Department, string> = {
    Accounts: "Accounts / billing lead",
    HR: "People ops",
    Marketing: "Marketing lead",
    "Clinical Operations": "Clinical program supervisor",
    Compliance: "Privacy Officer",
    Technology: "IT support",
    Leadership: "Executive on-call",
    General: "Team supervisor",
  };
  return map[department];
}
