/**
 * Canonical Memory hub deep links for Ask citations and in-app nav.
 * Keep all Layer 0–3 citation hrefs here — do not invent parallel /memory?tab= strings.
 */
export const MEMORY_DEEP_LINKS = {
  way: { label: "The Siya Way", href: "/memory?tab=way" },
  policies: { label: "Policies & requirements", href: "/memory?tab=policies" },
  knowledge: { label: "Decision log", href: "/memory?tab=knowledge" },
  memory: { label: "Memory", href: "/memory?tab=memory" },
  sops: { label: "Department SOPs", href: "/memory/knowledge/sops" },
} as const;
