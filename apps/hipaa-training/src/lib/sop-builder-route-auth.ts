import { getTrainingApiUrl } from "@/lib/trainingConfig";

export const sopBuilderMaxDuration = 60;

export async function requireSopBuilderAuth(req: Request): Promise<{ auth: string; token: string; isAdmin: boolean } | Response> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }
  const base = getTrainingApiUrl();
  if (!base) return Response.json({ error: "API not configured" }, { status: 503 });

  const accessRes = await fetch(`${base}/api/sop-builder/access`, { headers: { Authorization: auth } });
  if (!accessRes.ok) {
    const data = (await accessRes.json().catch(() => ({}))) as { error?: string };
    return Response.json({ error: data.error ?? "Access denied" }, { status: accessRes.status });
  }
  const access = (await accessRes.json()) as { canBuild?: boolean; isAdmin?: boolean };
  if (!access.canBuild) {
    return Response.json({ error: "Admin or department lead access required" }, { status: 403 });
  }
  return { auth, token: auth.slice(7), isAdmin: Boolean(access.isAdmin) };
}

export async function apiFetch(auth: string, path: string, init?: RequestInit) {
  const base = getTrainingApiUrl();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error((data.error as string) || `Request failed (${res.status})`);
  }
  return data;
}
