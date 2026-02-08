/**
 * Calgary-Cambridge aligned communication skills rubric.
 * Auto-scores MA performance based on detected behaviors.
 */

export interface RubricSkill {
  points: number
  description: string
}

export interface RubricDomain {
  [skill: string]: RubricSkill
}

export const COMMUNICATION_RUBRIC: Record<string, RubricDomain> = {
  gathering_information: {
    opens_appropriately: { points: 4, description: 'Clear, open question to identify patient concerns' },
    uses_open_then_closed: { points: 4, description: 'Appropriate progression from open to closed questions' },
    listens_without_interrupting: { points: 4, description: 'Allows patient to complete thoughts' },
    clarifies_and_summarizes: { points: 4, description: 'Periodically summarizes to verify understanding' },
  },
  developing_rapport: {
    shows_empathy: { points: 4, description: 'Acknowledges feelings, uses validating language' },
    non_judgmental: { points: 4, description: "Accepts patient's perspective without criticism" },
    establishes_partnership: { points: 4, description: 'Uses inclusive language (we, together)' },
  },
  explanation_planning: {
    checks_understanding: { points: 4, description: 'Verifies patient comprehension of explanations' },
    avoids_jargon: { points: 4, description: 'Uses plain language, explains medical terms' },
    organizes_information: { points: 4, description: 'Structures explanation logically with signposting' },
  },
  closing: {
    summarizes_plan: { points: 4, description: 'Recaps agreed-upon next steps' },
    invites_questions: { points: 4, description: 'Asks if patient has additional concerns' },
  },
}

const EMPATHY_KEYWORDS = [
  'understand', 'i see', 'that sounds', 'i hear you', 'must be', 'difficult',
  'concerning', 'worried', 'help', 'support', 'together', "let's work",
  'sorry to hear', 'i appreciate', 'thank you for sharing', 'that makes sense',
]

const OPEN_QUESTION_PATTERNS = /\b(how|what|when|where|why|tell me|can you describe)\b.*\?/i
const JARGON_PATTERN = /neuropsychological|pathophysiology|dopamine|prefrontal cortex|chemical imbalance|comprehensive evaluation/i
const INCLUSIVE_PATTERNS = /\b(we|together|let's|us)\b/i
const SUMMARY_PATTERNS = /\b(summarize|so to recap|in other words|to make sure|does that make sense)\b/i
const INVITE_QUESTIONS_PATTERNS = /\b(any questions|anything else|other concerns|something else|anything else you)\b/i

function maTextOnly(messages: { who: string; text: string }[]): string {
  return messages
    .filter((m) => m.who === 'you')
    .map((m) => m.text || '')
    .join(' ')
    .toLowerCase()
}

function detectSkill(skill: string, text: string, messageCount: number): boolean {
  switch (skill) {
    case 'opens_appropriately':
      return OPEN_QUESTION_PATTERNS.test(text) || /\?/.test(text)
    case 'uses_open_then_closed':
      return messageCount >= 2 && text.split(/\?/).length >= 2
    case 'listens_without_interrupting':
      return messageCount >= 2 && text.split(/\s+/).length >= 20
    case 'clarifies_and_summarizes':
      return SUMMARY_PATTERNS.test(text)
    case 'shows_empathy':
      return EMPATHY_KEYWORDS.some((kw) => text.includes(kw))
    case 'non_judgmental':
      return !/\b(should|must|need to|you have to)\b.*\b(you|your)\b/i.test(text) || text.length > 100
    case 'establishes_partnership':
      return INCLUSIVE_PATTERNS.test(text)
    case 'checks_understanding':
      return /\?/.test(text) && /(understand|makes sense|clear|follow)/i.test(text)
    case 'avoids_jargon':
      return !JARGON_PATTERN.test(text)
    case 'organizes_information':
      return /\b(first|then|next|finally|step)\b/i.test(text) || text.split(/\s+/).length >= 30
    case 'summarizes_plan':
      return /(next step|here\'s what|to recap|we\'ll|schedule|appointment)/i.test(text)
    case 'invites_questions':
      return INVITE_QUESTIONS_PATTERNS.test(text)
    default:
      return false
  }
}

export interface DomainScore {
  score: number
  maxScore: number
  demonstrated: boolean
}

export interface CalgaryCambridgeResult {
  domains: Record<string, Record<string, DomainScore>>
  totalScore: number
  maxTotalScore: number
  recommendations: string[]
}

export function autoScorePerformance(
  maMessages: { who: string; text: string }[],
  _assessmentData?: { responseLatencies?: number[] }
): CalgaryCambridgeResult {
  const text = maTextOnly(maMessages)
  const messageCount = maMessages.filter((m) => m.who === 'you').length
  const domains: CalgaryCambridgeResult['domains'] = {}
  let totalScore = 0
  let maxTotalScore = 0
  const recommendations: string[] = []

  for (const [domainId, skills] of Object.entries(COMMUNICATION_RUBRIC)) {
    domains[domainId] = {}
    for (const [skillId, rubricItem] of Object.entries(skills)) {
      const demonstrated = detectSkill(skillId, text, messageCount)
      const score = demonstrated ? rubricItem.points : 0
      domains[domainId][skillId] = {
        score,
        maxScore: rubricItem.points,
        demonstrated,
      }
      totalScore += score
      maxTotalScore += rubricItem.points

      if (!demonstrated && rubricItem.points >= 4) {
        const domainLabel = domainId.replace(/_/g, ' ')
        recommendations.push(`${domainLabel}: ${rubricItem.description}`)
      }
    }
  }

  return {
    domains,
    totalScore,
    maxTotalScore,
    recommendations: recommendations.slice(0, 5),
  }
}
