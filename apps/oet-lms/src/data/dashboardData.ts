/**
 * Dashboard data for Siya Health Virtual Medical Assistant Chat Simulator.
 * Recommended tasks, progress over time, gaps, suggested reading.
 * In production these would come from backend based on assistant performance.
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

/** 3 key recommended tasks based on performance (mock – replace with API). */
export function getRecommendedTasks(): RecommendedTask[] {
  return [
    {
      id: 'rec-1',
      title: 'Master "The Fast-Tracker" Scenario',
      description: 'You struggled with Emma\'s frustration when mentioning neuropsych testing. Practice explaining complex requirements in simple terms without jargon.',
      action: 'emma',
      priority: 'high',
    },
    {
      id: 'rec-2',
      title: 'Improve Cost Communication',
      description: 'Carlos requires upfront pricing clarity. Practice addressing financial concerns without being dismissive or vague about costs.',
      action: 'carlos',
      priority: 'medium',
    },
    {
      id: 'rec-3',
      title: 'Build Advanced Technical Knowledge',
      description: 'Dr. Priya\'s questions about ADHD methodology showed knowledge gaps. Read the protocols and return to her scenario.',
      action: 'priya',
      priority: 'low',
    },
  ]
}

/** Progress over time (mock – replace with API). */
export function getProgressOverTime(): ProgressPoint[] {
  return [
    { week: 'Week 1', chatsCompleted: 2, avgRubricScore: 62, label: 'Getting started' },
    { week: 'Week 2', chatsCompleted: 5, avgRubricScore: 71 },
    { week: 'Week 3', chatsCompleted: 4, avgRubricScore: 68 },
    { week: 'Week 4', chatsCompleted: 6, avgRubricScore: 78 },
    { week: 'This week', chatsCompleted: 3, avgRubricScore: 82 },
  ]
}

/** Gaps identified from recent performance (mock – replace with API). */
export function getGapsIdentified(): Gap[] {
  return [
    {
      id: 'gap-1',
      label: 'Timeline clarity',
      description: 'Providing specific timeframes (e.g. "1–2 weeks") instead of "we\'ll get you scheduled soon."',
      suggestedAction: 'Practice with Emma and Carlos; always state a number + unit.',
    },
    {
      id: 'gap-2',
      label: 'Avoiding jargon',
      description: 'Using plain language for neuropsych testing, prior auth, and processes.',
      suggestedAction: 'Review "Communication preferences" for each persona before chatting.',
    },
    {
      id: 'gap-3',
      label: 'Cost transparency',
      description: 'Addressing cost or payment plan early when the patient is uninsured or cost-sensitive.',
      suggestedAction: 'Practice with Carlos; mention cost in the first exchange when relevant.',
    },
  ]
}

/** Suggested reading (mock – replace with API). */
export function getSuggestedReading(): SuggestedReading[] {
  return [
    {
      id: 'read-1',
      title: 'ADHD care: What MAs need to know',
      description: 'Controlled substances, CSA, and neuropsych testing in plain language.',
      url: '#',
    },
    {
      id: 'read-2',
      title: 'Talking cost with uninsured patients',
      description: 'How to be upfront about fees and payment options without sounding salesy.',
      url: '#',
    },
    {
      id: 'read-3',
      title: 'De-escalating frustrated callers',
      description: 'Phrases that help vs. phrases that escalate.',
      url: '#',
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
}

/** Append a completed session to history (for Progress report). */
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
        message: `Transcript for ${transcript.personaName} has been sent to ${supervisorEmail}. (Stub – wire to your email/API.)`,
      })
    }, 500)
  })
}
