export type KbCategory = "hipaa" | "billing" | "escalation" | "telehealth" | "training";

export interface WorkspaceKbEntry {
  id: string;
  category: KbCategory;
  title: string;
  keywords: string[];
  body: string;
  links?: { label: string; href: string }[];
  escalate?: string;
}

export const WORKSPACE_KB: WorkspaceKbEntry[] = [
  {
    id: "escalation-map",
    category: "escalation",
    title: "Escalation pathways",
    keywords: ["escalate", "escalation", "who to call", "supervisor", "help"],
    body:
      "Order: (1) Supervisor / team lead — schedule & same-day workflow. (2) **Billing lead** — refunds, invoices, late cancel, no-show, Clarity payment status. (3) **Privacy Officer** — PHI, breaches, third-party callers. (4) **Clinical lead** — medical questions. (5) **IT** — telehealth/EHR. Never promise refunds or waivers without billing authorization.",
    links: [{ label: "HIPAA certification course", href: "/training" }],
  },
  {
    id: "hipaa-breach",
    category: "hipaa",
    title: "Suspected breach / privacy incident",
    keywords: ["breach", "phi", "unauthorized", "background", "video", "privacy"],
    body:
      "Stop further disclosure. Report **same day** to Privacy Officer. Document what happened and what PHI may have been exposed. Breach notification analysis is **not** an MA decision.",
    links: [{ label: "Breach module", href: "/module/breach" }],
    escalate: "Privacy Officer immediately",
  },
  {
    id: "third-party-caller",
    category: "hipaa",
    title: "Family / third party asking about charges",
    keywords: ["mom", "parent", "family", "third party", "verify"],
    body:
      "Verify identity and authorization before any PHI or billing detail. Minimum necessary only. Escalate if unsure — do not release account info to unverified callers.",
    escalate: "Privacy Officer / supervisor",
  },
  {
    id: "billing-late-cancel",
    category: "billing",
    title: "Late cancellation & refunds",
    keywords: ["late cancel", "cancellation", "refund", "same day"],
    body:
      "Follow **written billing policy** for the cancellation window. Do not promise refunds in chat. Document cancel time; escalate exceptions to **billing lead**.",
    escalate: "Billing lead",
  },
  {
    id: "billing-no-show",
    category: "billing",
    title: "No-show & provider cancel",
    keywords: ["no show", "no-show", "provider cancel", "reschedule"],
    body:
      "Provider cancel: usually not patient late-cancel; offer reschedule; refunds are a **billing** decision. Patient no-show: apply policy consistently; escalate exceptions to supervisor.",
    escalate: "Billing lead + supervisor",
  },
  {
    id: "telehealth-privacy",
    category: "telehealth",
    title: "Telehealth — others in background",
    keywords: ["telehealth", "video", "background", "camera", "private"],
    body:
      "Require a private setting. Unauthorized viewers during PHI discussion is a privacy risk — pause visit, request private space, report if PHI may have been disclosed.",
    escalate: "Privacy Officer if PHI exposed",
  },
  {
    id: "training-cert",
    category: "training",
    title: "HIPAA certification course",
    keywords: ["course", "certification", "certificate", "training", "quiz"],
    body: "Structured modules, quizzes, and final exam are under **Training**.",
    links: [{ label: "Open training", href: "/training" }],
  },
];
