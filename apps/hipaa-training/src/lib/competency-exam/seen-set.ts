/**
 * Exam seen-set — exclude items a person has already been measured on.
 * When the unused pool is smaller than the sitting, oldest seen items may return
 * and must be labeled as repeats (not a fresh measure).
 */

export type SeenEntry = {
  pool: string;
  id: string;
  attemptId: string;
  at: number;
  repeated: boolean;
};

export type SeenDraw<T extends { id: string }> = {
  items: T[];
  repeatedIds: string[];
  unusedRemaining: number;
};

export function drawUnseen<T extends { id: string }>(
  pool: T[],
  seen: SeenEntry[],
  count: number,
  seed: number,
  poolKey: string,
): SeenDraw<T> {
  const n = Math.max(0, Math.min(count, pool.length));
  const seenIds = seen.filter((s) => s.pool === poolKey).map((s) => s.id);
  const seenSet = new Set(seenIds);
  const unused = pool.filter((item) => !seenSet.has(item.id));
  const used = pool.filter((item) => seenSet.has(item.id));
  const fresh = shuffle(unused, seed);
  const taken = fresh.slice(0, n);
  const repeated: T[] = [];
  if (taken.length < n) {
    const need = n - taken.length;
    const oldestFirst = [...used].sort((a, b) => {
      const ai = seenIds.lastIndexOf(a.id);
      const bi = seenIds.lastIndexOf(b.id);
      return ai - bi;
    });
    repeated.push(...oldestFirst.slice(0, need));
  }
  return {
    items: [...taken, ...repeated],
    repeatedIds: repeated.map((item) => item.id),
    unusedRemaining: Math.max(0, unused.length - taken.length),
  };
}

export function recordSeen(
  prev: SeenEntry[],
  pool: string,
  ids: string[],
  repeatedIds: string[],
  attemptId: string,
  at = Date.now(),
): SeenEntry[] {
  const repeated = new Set(repeatedIds);
  const next = [...prev];
  for (const id of ids) {
    next.push({ pool, id, attemptId, at, repeated: repeated.has(id) });
  }
  return next;
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  // Mulberry32 — the old LCG (mod 233280) was heavily biased (doc-refill ~18% vs ~6.7% fair).
  let s = (seed >>> 0) || 1;
  const next = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** High-entropy seed for isolated review draws (not Date.now()%233280). */
export function freshDrawSeed(): number {
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    return buf[0] >>> 0;
  }
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}
