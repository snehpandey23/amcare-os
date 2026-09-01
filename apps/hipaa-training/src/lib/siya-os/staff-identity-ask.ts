/**
 * Session + directory identity — "who am I" / "who is Name".
 */
import { getTrainingApiUrl } from "@/lib/trainingConfig";

export type ViewerIdentity = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

export type IdentityAnswer = {
  message: string;
  sources: { title: string; id: string }[];
};

function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ");
}

function namesMatch(a: string, b: string): boolean {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const aw = na.split(" ").filter(Boolean);
  const bw = nb.split(" ").filter(Boolean);
  if (aw.length === 1 && bw.some((w) => w === aw[0] && w.length >= 3)) return true;
  if (bw.length === 1 && aw.some((w) => w === bw[0] && w.length >= 3)) return true;
  return false;
}

export function isWhoAmIQuery(message: string): boolean {
  const t = norm(message);
  return (
    /^who am i\??$/.test(t) ||
    /^who am i logged in as\??$/.test(t) ||
    /^what('?s| is) my (name|account|login)\??$/.test(t) ||
    /^what('?s| is) my display name\??$/.test(t)
  );
}

export function extractWhoIsName(message: string): string | null {
  const m = message.trim().match(/^who\s+is\s+(.+?)\??$/i);
  if (!m) return null;
  const name = m[1]!.trim();
  if (name.length < 2 || name.length > 60) return null;
  if (/^(the|a|an|your|my)\b/i.test(name)) return null;
  // Product / assistant — not a roster person ("who is siya").
  if (/^siya(\s+assist|\s+health|\s+os)?$/i.test(name)) return null;
  // Presence / status — never treat as a person name ("who is loggin in", "who is online").
  if (
    /\b(loggin|logging|logged|online|working|present|here|active|around|available|on\s+(the\s+)?(clock|shift|floor))\b/i.test(
      name,
    )
  ) {
    return null;
  }
  if (/\b(lead|hr|billing|clinical|manager|supervisor)\b/i.test(name) && name.split(/\s+/).length <= 2) {
    // department-lead asks handled elsewhere
    if (/^(hr|clinical|billing|marketing|compliance|accounts|technology)\s+lead$/i.test(name)) return null;
  }
  return name;
}

export async function fetchViewerIdentity(authToken: string): Promise<ViewerIdentity | null> {
  const base = getTrainingApiUrl();
  if (!base) return null;
  const res = await fetch(`${base}/api/auth/me`, {
    headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
  });
  if (!res.ok) return null;
  const data = (await res.json().catch(() => ({}))) as Partial<ViewerIdentity>;
  if (!data?.id || !data?.email) return null;
  return {
    id: data.id,
    email: data.email,
    name: data.name ?? null,
    role: data.role || "trainee",
  };
}

async function fetchDirectoryPeople(
  authToken: string,
): Promise<{ id: string; name: string | null; email: string }[]> {
  const base = getTrainingApiUrl();
  if (!base) return [];
  const res = await fetch(`${base}/api/knowledge/team-assignees`, {
    headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
  });
  if (!res.ok) return [];
  const data = (await res.json().catch(() => ({}))) as {
    members?: { id: string; name: string | null; email: string }[];
  };
  return data.members ?? [];
}

export function formatWhoAmI(viewer: ViewerIdentity): IdentityAnswer {
  const label = viewer.name?.trim() || viewer.email;
  return {
    message: [
      `You’re signed in as **${label}**.`,
      `• **Email:** ${viewer.email}`,
      `• **Portal role:** ${viewer.role === "admin" ? "Admin" : "Staff"}`,
    ].join("\n"),
    sources: [{ title: "Signed-in session", id: "session-identity" }],
  };
}

export async function answerWhoIsQuery(
  message: string,
  authToken: string | null,
): Promise<IdentityAnswer | null> {
  if (isWhoAmIQuery(message)) {
    if (!authToken) {
      return {
        message: "Sign in and ask again — I’ll read your account name from this session.",
        sources: [],
      };
    }
    const viewer = await fetchViewerIdentity(authToken);
    if (!viewer) {
      return {
        message: "I couldn’t read your session just now. Refresh and ask **who am I** again.",
        sources: [],
      };
    }
    return formatWhoAmI(viewer);
  }

  const whoName = extractWhoIsName(message);
  if (!whoName) return null;
  if (!authToken) {
    return {
      message: `Sign in and ask again — I’ll look up **${whoName}** from the staff directory (I won’t invent people).`,
      sources: [],
    };
  }

  const viewer = await fetchViewerIdentity(authToken);
  if (viewer) {
    const selfNames = [viewer.name, viewer.email, viewer.email.split("@")[0]].filter(Boolean) as string[];
    if (selfNames.some((n) => namesMatch(n, whoName))) {
      return {
        message: [
          `**${whoName}** is **you** on this session.`,
          "",
          formatWhoAmI(viewer).message,
        ].join("\n"),
        sources: [{ title: "Signed-in session", id: "session-identity" }],
      };
    }
  }

  const people = await fetchDirectoryPeople(authToken);
  const hits = people.filter(
    (p) =>
      (p.name && namesMatch(p.name, whoName)) ||
      namesMatch(p.email, whoName) ||
      namesMatch(p.email.split("@")[0] || "", whoName),
  );

  if (hits.length === 1) {
    const p = hits[0]!;
    return {
      message: [
        `**${p.name?.trim() || p.email}** is on the staff roster.`,
        `• **Email:** ${p.email}`,
        viewer && p.id === viewer.id ? "• That’s **your** account." : null,
      ]
        .filter(Boolean)
        .join("\n"),
      sources: [{ title: "Staff directory (portal)", id: "team-assignees" }],
    };
  }
  if (hits.length > 1) {
    return {
      message: [
        `A few roster matches for **${whoName}**:`,
        ...hits.slice(0, 5).map((p) => `• **${p.name?.trim() || p.email}** — ${p.email}`),
        "Say the email if you meant a specific person.",
      ].join("\n"),
      sources: [{ title: "Staff directory (portal)", id: "team-assignees" }],
    };
  }

  return {
    message: [
      `I don’t see **${whoName}** on the staff roster under that name.`,
      "I won’t invent a person. Try the email, or open **Team** / **Admin → Team**.",
    ].join("\n"),
    sources: [{ title: "Staff directory (portal)", id: "team-assignees" }],
  };
}
