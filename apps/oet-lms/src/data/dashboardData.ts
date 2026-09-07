/**
 * Dashboard helpers for MA Chat Simulator.
 * Session history is real (localStorage / API). Aggregate analytics that are not
 * yet computed from sessions must return empty — never fabricated numbers.
 */

export interface RecommendedTask {
  id: string
  title: string
  description: string
  /** Route or persona id to start the task */
  action: string
  priority: 'high' | 'medium' | 'low'
}

export interface ProgressPoint {
  week: string
  chatsCompleted: number
  avgRubricScore: number
  label?: string
}

export interface Gap {
  id: string
  label: string
  description: string
  suggestedAction: string
}

export interface SuggestedReading {
  id: string
  title: string
  description: string
  url?: string
}

/**
 * Static practice suggestions (not performance-derived).
 * Do not claim the learner “struggled” without real session analysis.
 */
export function getPracticeSuggestions(): RecommendedTask[] {
  return [
    {
      id: 'rec-1',
      title: 'Practice Emma — The Fast-Tracker',
      description:
        'College student seeking Adderall renewal; practice clear timelines and plain-language explanations (not jargon).',
      action: 'emma',
      priority: 'high',
    },
    {
      id: 'rec-2',
      title: 'Practice Carlos — cost clarity',
      description: 'Uninsured / cost-sensitive caller; practice naming fees and next steps early.',
      action: 'carlos',
      priority: 'medium',
    },
    {
      id: 'rec-3',
      title: 'Browse Resources',
      description: 'Read the listed MA resources, then return to a persona chat.',
      action: 'priya',
      priority: 'low',
    },
  ]
}

/** @deprecated Use getPracticeSuggestions — name kept for older imports. */
export function getRecommendedTasks(): RecommendedTask[] {
  return getPracticeSuggestions()
}

/**
 * Aggregated progress over time — not implemented yet.
 * Returns empty so UI can show an honest empty state (never mock weeks/scores).
 */
export function getProgressOverTime(): ProgressPoint[] {
  return []
}

/**
 * Auto-identified gaps — not implemented yet.
 * Returns empty for an honest empty state.
 */
export function getGapsIdentified(): Gap[] {
  return []
}

/** Static reading list (not personalized analytics). */
export function getSuggestedReading(): SuggestedReading[] {
  return [
    {
      id: 'read-1',
      title: 'ADHD care: What MAs need to know',
      description: 'Controlled substances, CSA, and neuropsych testing in plain language.',
    },
    {
      id: 'read-2',
      title: 'Talking cost with uninsured patients',
      description: 'How to be upfront about fees and payment options without sounding salesy.',
    },
    {
      id: 'read-3',
      title: 'De-escalating frustrated callers',
      description: 'Phrases that help vs. phrases that escalate.',
    },
  ]
}

const LAST_TRANSCRIPT_KEY = 'siya_last_transcript'
const SESSION_HISTORY_KEY = 'siya_session_history'
const MAX_SESSION_HISTORY = 50

export interface SessionRecord {
  id: string
  personaId: string
  personaName: string
  timestamp: number
  messageCount: number
  empathyScore: number
  grammarScore: number
  avgWpm: number
  calgaryScore?: number
  calgaryMax?: number
  /** true when patient replies were canned demo (not live LLM). */
  demoMode?: boolean
}

/** Append a completed session to history (for Progress / Dashboard). */
export function saveSessionToHistory(record: SessionRecord): void {
  try {
    const raw = localStorage.getItem(SESSION_HISTORY_KEY)
    const list: SessionRecord[] = raw ? JSON.parse(raw) : []
    list.unshift(record)
    const trimmed = list.slice(0, MAX_SESSION_HISTORY)
    localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(trimmed))
  } catch {
    // ignore
  }
}

/** Get recent session history for Progress report. */
export function getSessionHistory(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(SESSION_HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SessionRecord[]
  } catch {
    return []
  }
}

/** Real totals from saved sessions only. */
export function summarizeSessionStats(sessions: SessionRecord[]): {
  totalSessions: number
  avgEmpathy: number | null
  avgGrammar: number | null
  avgWpm: number | null
  byPersona: { label: string; sessions: number; avgEmpathy: number }[]
} {
  if (!sessions.length) {
    return { totalSessions: 0, avgEmpathy: null, avgGrammar: null, avgWpm: null, byPersona: [] }
  }
  const avg = (nums: number[]) =>
    nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null
  const byMap = new Map<string, { empathy: number[]; count: number }>()
  for (const s of sessions) {
    const cur = byMap.get(s.personaName) ?? { empathy: [], count: 0 }
    cur.empathy.push(s.empathyScore)
    cur.count += 1
    byMap.set(s.personaName, cur)
  }
  return {
    totalSessions: sessions.length,
    avgEmpathy: avg(sessions.map((s) => s.empathyScore)),
    avgGrammar: avg(sessions.map((s) => s.grammarScore)),
    avgWpm: avg(sessions.map((s) => s.avgWpm).filter((n) => n > 0)),
    byPersona: [...byMap.entries()].map(([label, v]) => ({
      label,
      sessions: v.count,
      avgEmpathy: avg(v.empathy) ?? 0,
    })),
  }
}

/** Save the last chat transcript so the dashboard can send it to a supervisor. */
export function saveLastTranscript(personaName: string, lines: { who: string; text: string }[]): void {
  try {
    sessionStorage.setItem(LAST_TRANSCRIPT_KEY, JSON.stringify({ personaName, lines }))
  } catch {
    // ignore
  }
}

/** Get the last saved transcript (from sessionStorage). */
export function getLastTranscript(): { personaName: string; lines: { who: string; text: string }[] } | null {
  try {
    const raw = sessionStorage.getItem(LAST_TRANSCRIPT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as { personaName: string; lines: { who: string; text: string }[] }
  } catch {
    return null
  }
}

/** Send chat transcript to supervisor (stub – replace with API/email). */
export function sendTranscriptToSupervisor(
  supervisorEmail: string,
  transcript: { personaName: string; lines: { who: string; text: string }[] }
): Promise<{ ok: boolean; message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Send transcript to supervisor:', { supervisorEmail, transcript })
      resolve({
        ok: true,
        message: `Transcript for ${transcript.personaName} queued for ${supervisorEmail}. (Email delivery not wired yet — stub only.)`,
      })
    }, 500)
  })
}
