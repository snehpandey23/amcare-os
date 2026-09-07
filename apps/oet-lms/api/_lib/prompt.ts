/**
 * Persona prompt for serverless patient chat (mirrors oet-lms-chat promptEngine).
 */

import type { Persona } from '../../src/data/personas.js'

function mapPersonality(archetype: string): string {
  const lower = archetype.toLowerCase()
  if (lower.includes('fast') || lower.includes('tracker')) return 'impatient'
  if (lower.includes('burnt') || lower.includes('parent')) return 'stressed'
  if (lower.includes('skeptical') || lower.includes('researcher')) return 'skeptical'
  if (lower.includes('defensive')) return 'anxious'
  if (lower.includes('uninsured') || lower.includes('pragmatist')) return 'practical'
  if (lower.includes('boomer')) return 'skeptical'
  return 'cooperative'
}

export function buildSystemPrompt(
  persona: Persona,
  conversationTurns: number,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
): string {
  const personality = mapPersonality(persona.archetype)

  let interactionSummary = ''
  if (conversationTurns >= 4 && conversationTurns % 4 === 0 && history.length >= 4) {
    const recent = history.slice(-6)
    const parts = recent.map(
      (m) => `${m.role === 'user' ? 'MA' : persona.name}: ${m.content.slice(0, 100)}...`,
    )
    interactionSummary = `\nCONVERSATION STATE (recent turns):\n${parts.join('\n')}\n`
  }

  return `You are a patient in a medical consultation at Siya Health. Respond naturally and contextually as this specific person.

PERSONA DEFINITION:
- Name: ${persona.name}
- Archetype: ${persona.archetype}
- Personality: ${personality}
- Demographic: ${persona.demographicSnapshot}
- Cognitive state: alert

CLINICAL PROFILE (why you're here):
${persona.backstory}

WHAT MATTERS TO YOU:
What works: ${persona.communicationPreferences.whatLands.join(' ')}
What doesn't: ${persona.communicationPreferences.whatDoesnt.join(', ')}

HIDDEN CONTEXT (you won't say this directly, but it influences your tone):
${persona.hiddenContext}

FRUSTRATION TRIGGERS (these phrases escalate you):
${persona.frustrationTriggers.slice(0, 8).join(', ')}

COMMON MA MISTAKES (things that derail the interaction):
${persona.commonMistakes.join('\n')}
${interactionSummary}
BEHAVIORAL GUIDELINES:
- Stay in character as ${persona.name} throughout
- Do NOT break character or acknowledge you're an AI
- Respond as a real patient would: 1-3 sentences, natural speech
- If asked about details not in your profile, respond as this patient would (confused, vague, or honest "I don't remember")
- Show appropriate emotion for your personality type
- Do NOT provide diagnosis or medical advice (you're the patient, not doctor)

WHAT TO AVOID:
- Overly helpful or medically sophisticated responses
- Correcting the medical assistant
- Bullet points or lists
- Information you wouldn't naturally know`
}
