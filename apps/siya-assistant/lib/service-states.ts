/**
 * Org telehealth footprint vs out-of-service states for Siya Guide.
 * Supported states must stay aligned with apps/siya-health/data/site-standards.mjs
 * AVAILABLE_SERVICE_STATES.
 */

export const SUPPORTED_SERVICE_STATES = [
  'California',
  'Texas',
  'Pennsylvania',
  'Florida',
] as const

/** Full names + common abbreviations for supported footprint. */
const SUPPORTED_RE = /\b(california|texas|pennsylvania|florida|ca|tx|pa|fl)\b/i

/**
 * Common out-of-footprint states visitors ask about.
 * Prefer full names; only use unambiguous abbreviations (avoid: or, in, ma, me, hi, la, al, co, wa).
 */
const UNSUPPORTED_STATES: Array<{ name: string; re: RegExp }> = [
  { name: 'New York', re: /\b(new york|ny)\b/i },
  { name: 'Ohio', re: /\bohio\b/i },
  { name: 'Arizona', re: /\b(arizona|az)\b/i },
  { name: 'Georgia', re: /\b(georgia|ga)\b/i },
  { name: 'Illinois', re: /\billinois\b/i },
  { name: 'Michigan', re: /\bmichigan\b/i },
  { name: 'New Jersey', re: /\b(new jersey|nj)\b/i },
  { name: 'Washington', re: /\b(washington state|seattle)\b/i },
  { name: 'Massachusetts', re: /\b(massachusetts|boston)\b/i },
  { name: 'Colorado', re: /\b(colorado|denver)\b/i },
  { name: 'North Carolina', re: /\b(north carolina|nc)\b/i },
  { name: 'Virginia', re: /\bvirginia\b/i },
  { name: 'Maryland', re: /\bmaryland\b/i },
  { name: 'Nevada', re: /\b(nevada|las vegas)\b/i },
  { name: 'Oregon', re: /\b(oregon|portland)\b/i },
  { name: 'Connecticut', re: /\bconnecticut\b/i },
  { name: 'Minnesota', re: /\bminnesota\b/i },
  { name: 'Tennessee', re: /\btennessee\b/i },
  { name: 'Missouri', re: /\bmissouri\b/i },
  { name: 'Indiana', re: /\bindiana\b/i },
  { name: 'Wisconsin', re: /\bwisconsin\b/i },
  { name: 'Alabama', re: /\balabama\b/i },
  { name: 'South Carolina', re: /\b(south carolina)\b/i },
  { name: 'Louisiana', re: /\blouisiana\b/i },
  { name: 'Kentucky', re: /\bkentucky\b/i },
  { name: 'Oklahoma', re: /\boklahoma\b/i },
  { name: 'Utah', re: /\butah\b/i },
  { name: 'New Mexico', re: /\bnew mexico\b/i },
  { name: 'Hawaii', re: /\bhawaii\b/i },
  { name: 'Alaska', re: /\balaska\b/i },
  { name: 'District of Columbia', re: /\b(washington ?d\.?c\.?|district of columbia)\b/i },
]

export function isSupportedServiceStateMention(text: string): boolean {
  return SUPPORTED_RE.test(text)
}

/** First unsupported state mentioned, if any. */
export function matchUnsupportedState(text: string): { name: string } | null {
  for (const s of UNSUPPORTED_STATES) {
    if (s.re.test(text)) return { name: s.name }
  }
  return null
}

/**
 * True when the visitor is asking about geographic availability / serving a place.
 * Used so bare "telehealth" alone does not force a states answer.
 */
export function isStateAvailabilityQuestion(text: string): boolean {
  return /\b(what states|which states|do you (serve|see|treat|accept|cover)|available in|serve patients|see patients|licensed in|live in|i'?m in|from |in my state|states? (you|ya) serve|where (do you|can i)|telehealth in)\b/i.test(
    text,
  )
}
