import type { RefusalCategory } from './types'

export const MAX_MESSAGE_LENGTH = 500
export const MAX_MESSAGES_PER_WINDOW = 20
export const RATE_WINDOW_MS = 10 * 60 * 1000

const rateBuckets = new Map<string, number[]>()

export function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const prev = (rateBuckets.get(key) || []).filter((t) => now - t < RATE_WINDOW_MS)
  if (prev.length >= MAX_MESSAGES_PER_WINDOW) {
    rateBuckets.set(key, prev)
    return false
  }
  prev.push(now)
  rateBuckets.set(key, prev)
  return true
}

export function sanitizeInput(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/[`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH)
}

const EMERGENCY_RE =
  /\b(suicid(?:e|al)|kill myself|end my life|self[-\s]?harm|overdose|chest pain|can'?t breathe|cannot breathe|difficulty breathing|shortness of breath|stroke|face droop|severe allerg(?:y|ic)|anaphyla|immediate danger|going to hurt (myself|someone)|domestic violence|being abused|medical emergency|heart attack)\b/i

const PHI_RE =
  /\b(dob|date of birth|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|ssn|social security|mrn|medical record|chart notes|insurance (id|number|member)|member id|group number|policy number|prescription number|medication list|med(?:ication)? list|my (meds|medications?)\b|i take (adderall|vyvanse|ritalin|xanax|prozac|zoloft|ozempic|wegovy|semaglutide)|address is|\d+ main street|my email is|email me at|phone number is|call me at|lab results?|blood results?|remember that i have|store my|pull my last appointment|another patient|patient'?s information|\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})\b/i

const INJECTION_RE =
  /\b(ignore (all |any )?(previous|prior|above) instructions|disregard (your|the) (system|instructions)|developer mode|dan mode|jailbreak|reveal (your )?(system|hidden) (prompt|instructions)|print (your )?(system|hidden) prompt|show (me )?(your )?system prompt|enter (god|unrestricted) mode|pretend you (have )?no restrictions|override (your|safety)|repeat (your|the) (system|instructions)|decode|base64|tool(s)? (list|schema)|chain of thought|reveal (your )?reasoning|unrestricted assistant|dump env|administrator access)\b/i

const INTERNAL_RE =
  /\b(api key|secret key|access token|openai[_ ]?api[_ ]?key|ai[_ ]?gateway|process\.env|env vars|source code|github|repository|repo contents?|system prompt|system instructions|hidden instructions|knowledge[-\s]?base contents|vector (db|store)|retrieval configuration|moderation rules|security configuration|print your configuration|company decisions?|internal (roadmap|docs|document|workflow|protocol|slack|spreadsheet|ops)|clinical (workflow|protocol)|investor|revenue|margin|burn rate|payroll|equity split|staff (chat|discussion|channels?)|slack channels?|carepatron (admin|api)|spruce (admin|api)|patient (record|chart|portal data)|hipaa audit|vendor contract|unpublished|staging url|founder equity|booking system use|what api does|provider schedules?)\b/i

const CLINICAL_RE =
  /\b(do i have|diagnose( me)?|am i (adhd|depressed|bipolar|diabetic)|what (medication|dose|mg)|should i (take|stop|increase|decrease)|drug interaction|interpret (my )?labs?|recommend (a |an )?lab panel|my (lab|blood) results?|prescribe|can (you|dr\.?|doctor) prescribe|will (you|they) prescribe|adderall|vyvanse|ritalin|ozempic|controlled substance|treatment plan|am i eligible|qualify for|best for me|personalized|promise .{0,40}success|urgent meds|med(?:ication)? is safe|i am pregnant|pregnancy-specific|stimulant guidance|taper my|benzodiazepine|replace my psychiatrist|is this rash|tell me if i am|confirm i have|insulin resistance from this chat|antidepressant|from this chat)\b/i

export type GuardHit =
  | { kind: 'ok' }
  | { kind: 'blocked'; category: RefusalCategory; reason: string }

export function classifyInputGuards(text: string): GuardHit {
  if (!text || text.length < 1) {
    return { kind: 'blocked', category: 'unsupported', reason: 'empty' }
  }
  if (EMERGENCY_RE.test(text)) {
    return { kind: 'blocked', category: 'emergency', reason: 'emergency' }
  }
  if (INJECTION_RE.test(text)) {
    return { kind: 'blocked', category: 'injection', reason: 'injection' }
  }
  // PHI before internal so patient-info requests get privacy handoff
  if (PHI_RE.test(text)) {
    return { kind: 'blocked', category: 'phi', reason: 'phi' }
  }
  if (INTERNAL_RE.test(text)) {
    return { kind: 'blocked', category: 'internal', reason: 'internal' }
  }
  if (CLINICAL_RE.test(text)) {
    return { kind: 'blocked', category: 'clinical', reason: 'clinical' }
  }
  return { kind: 'ok' }
}

const SECRETISH =
  /\b(sk-[a-zA-Z0-9]{10,}|AI_GATEWAY_API_KEY|OPENAI_API_KEY|process\.env|localhost:\d+|127\.0\.0\.1|vercel\.app\/_|\.env\b|SYSTEM_PROMPT|ignore previous instructions)\b/i

const URL_RE = /https?:\/\/[^\s)>\]]+/gi

const ALLOWED_URL_HOSTS = new Set([
  'www.siya.health',
  'siya.health',
  'form.carepatron.com',
  'book.carepatron.com',
  'spruce.care',
  'www.zocdoc.com',
  'labs.rupahealth.com',
])

export function scrubOutputText(text: string): string {
  let out = text.replace(/<[^>]*>/g, '')
  out = out.replace(/```[\s\S]*?```/g, '')
  out = out.replace(SECRETISH, '[redacted]')
  out = out.replace(URL_RE, (url) => {
    try {
      const u = new URL(url)
      if (!ALLOWED_URL_HOSTS.has(u.hostname)) return '[link removed]'
      return url
    } catch {
      return '[link removed]'
    }
  })
  const words = out.trim().split(/\s+/)
  if (words.length > 130) {
    out = words.slice(0, 120).join(' ') + '…'
  }
  return out.trim()
}

export function analyticsForLinkId(id: string): string | undefined {
  if (id === 'secure_chat') return 'secure_chat_handoff'
  if (id === 'meet_and_greet' || id === 'book_appointment') return 'booking_handoff'
  if (id === 'adhd_screening') return 'screening_link_clicked'
  if (
    ['adhd_care', 'primary_care', 'labs', 'telehealth', 'womens_midlife', 'mens_health', 'weight_loss'].includes(
      id,
    )
  ) {
    return 'service_link_clicked'
  }
  return undefined
}