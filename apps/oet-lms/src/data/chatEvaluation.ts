/**
 * Chat evaluation: empathy, grammar, accuracy (placeholder), typing speed.
 * Used after "End chat" to score MA responses in therapeutic back-and-forth encounters.
 */

/** Phrases we count as empathetic (e.g. after patient says something). */
const EMPATHY_PHRASES = [
  'sorry to hear',
  'i understand',
  'i hear you',
  'that must be',
  'that sounds',
  'i can imagine',
  'i appreciate',
  'thank you for sharing',
  'that\'s understandable',
  'i get that',
  'i see',
  'that makes sense',
  'i\'m sorry',
  'we understand',
  'i know how',
  'that can be',
  'glad you reached out',
  'happy to help',
]

/** Simple grammar heuristics: double space, missing sentence end, no capital at start. */
function hasObviousGrammarIssues(text: string): boolean {
  const t = text.trim()
  if (!t) return true
  if (/\s{2,}/.test(t)) return true
  const lastChar = t.slice(-1)
  if (!/[.!?]/.test(lastChar)) return true
  const firstChar = t[0]
  if (firstChar !== firstChar.toUpperCase() || firstChar === firstChar.toLowerCase()) return true
  return false
}

export interface MessageWithTiming {
  who: string
  text: string
  /** When user started typing this message (only for 'you'). */
  startedAt?: number
  /** When user sent this message (only for 'you'). */
  sentAt?: number
}

export interface ChatEvaluationResult {
  /** 0–100: share of MA messages that contain at least one empathy phrase. */
  empathyScore: number
  /** 0–100: share of MA messages with no obvious grammar issues. */
  grammarScore: number
  /** Placeholder: "Reviewed manually" until we have semantic accuracy. */
  accuracyNote: string
  /** Average words per minute across MA messages (real-time typing). */
  avgWpm: number
  /** Number of MA messages. */
  messageCount: number
  /** Average response latency (first token time - ma send time) in ms. */
  avgResponseLatencyMs?: number
  /** Latency quality band: excellent <1500ms, good <3000ms, slow >=3000ms. */
  latencyQuality?: string
  /** Count of MA messages with grammar issues (heuristic). */
  grammarErrorCount?: number
  /** Severity: minor if few errors, major if many. */
  grammarSeverity?: 'none' | 'minor' | 'major'
  /** Per-message breakdown for display. */
  details: {
    empathyDetected: boolean
    grammarOk: boolean
    wpm: number
  }[]
}

export function evaluateChat(maMessages: MessageWithTiming[], responseLatencies?: number[]): ChatEvaluationResult {
  const details: ChatEvaluationResult['details'] = []
  let empathyCount = 0
  let grammarOkCount = 0
  let totalWords = 0
  let totalMinutes = 0

  for (const msg of maMessages) {
    if (msg.who !== 'you') continue
    const text = (msg.text || '').toLowerCase()
    const hasEmpathy = EMPATHY_PHRASES.some((p) => text.includes(p))
    const grammarOk = !hasObviousGrammarIssues(msg.text || '')
    let wpm = 0
    if (msg.startedAt != null && msg.sentAt != null && msg.sentAt > msg.startedAt) {
      const words = (msg.text || '').trim().split(/\s+/).filter(Boolean).length
      const minutes = (msg.sentAt - msg.startedAt) / 60000
      wpm = minutes > 0 ? Math.round(words / minutes) : 0
      totalWords += words
      totalMinutes += minutes
    }
    details.push({ empathyDetected: hasEmpathy, grammarOk, wpm })
    if (hasEmpathy) empathyCount++
    if (grammarOk) grammarOkCount++
  }

  const n = maMessages.filter((m) => m.who === 'you').length
  const grammarErrorCount = details.filter((d) => !d.grammarOk).length
  const grammarSeverity: 'none' | 'minor' | 'major' =
    grammarErrorCount === 0 ? 'none' : grammarErrorCount <= Math.ceil(n / 2) ? 'minor' : 'major'
  const avgResponseLatencyMs =
    responseLatencies != null && responseLatencies.length > 0
      ? Math.round(responseLatencies.reduce((a, b) => a + b, 0) / responseLatencies.length)
      : undefined
  const latencyQuality =
    avgResponseLatencyMs != null
      ? avgResponseLatencyMs < 1500
        ? 'excellent'
        : avgResponseLatencyMs < 3000
          ? 'good'
          : 'slow'
      : undefined

  return {
    empathyScore: n > 0 ? Math.round((empathyCount / n) * 100) : 0,
    grammarScore: n > 0 ? Math.round((grammarOkCount / n) * 100) : 0,
    accuracyNote: 'Reviewed manually — we check how well your replies address what the patient asked.',
    avgWpm: totalMinutes > 0 ? Math.round(totalWords / totalMinutes) : 0,
    messageCount: n,
    avgResponseLatencyMs,
    latencyQuality,
    grammarErrorCount: n > 0 ? grammarErrorCount : undefined,
    grammarSeverity: n > 0 ? grammarSeverity : undefined,
    details,
  }
}
