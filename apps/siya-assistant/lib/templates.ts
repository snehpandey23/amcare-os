import { resolveLinks } from './link-registry'
import type { GuideResponse } from './types'

export const OPENING_MESSAGE = `Hi — I’m Siya’s AI Concierge. I can help you explore services, screenings, Health Guides, labs, and appointment options.

Please don’t enter medical records, medication details, dates of birth, addresses, insurance information, or other sensitive personal information here.`

export const EMERGENCY_MESSAGE =
  'This chat cannot provide emergency care. If you may be in immediate danger or experiencing a medical emergency, call 911 or go to the nearest emergency department. For suicidal thoughts or a mental health crisis in the United States, call or text 988.'

export const PRIVACY_MESSAGE =
  'For your privacy, please don’t share personal medical information in this website chat. Private clinical conversations aren’t handled here.'

export const PRIVATE_DISCUSSION_MESSAGE =
  'If you’d like a more private conversation about your health before paying for a full visit, that isn’t something this website chat can do. You can book a free Meet & Greet, or download our partner app Spruce and join the Siya Health practice there for secure messaging with the clinical team.'

export const INTERNAL_MESSAGE =
  'I can only help with Siya Health’s publicly available services, resources, and website navigation.'

export const NOT_FOUND_MESSAGE =
  'I’m not able to confirm that from Siya Health’s published information.'

export const CLINICAL_MESSAGE =
  'I can share general information from Siya Health’s published resources, but I can’t diagnose conditions or recommend individual treatment.'

export function emergencyResponse(): GuideResponse {
  return {
    state: 'emergency',
    message: EMERGENCY_MESSAGE,
    followUp: 'If you’re safe and want help finding a Siya page afterward, just tell me what you’re looking for.',
    links: [],
    citations: [],
    refusalCategory: 'emergency',
    analyticsEvent: 'bot_refusal_category',
  }
}

/** PHI / private clinical discussion before paying — Meet & Greet or Spruce only */
export function privacyResponse(): GuideResponse {
  return {
    state: 'privacy',
    message: `${PRIVACY_MESSAGE} ${PRIVATE_DISCUSSION_MESSAGE}`,
    followUp: 'Would you prefer a free Meet & Greet, or joining Siya on Spruce for secure messaging?',
    links: resolveLinks(['meet_and_greet', 'spruce_practice', 'call_siya']),
    citations: [],
    refusalCategory: 'phi',
    analyticsEvent: 'secure_chat_handoff',
  }
}

export function privateDiscussionResponse(): GuideResponse {
  return {
    state: 'restricted',
    message: PRIVATE_DISCUSSION_MESSAGE,
    followUp: 'Prefer Meet & Greet, Spruce messaging, or just the call/text number for a quick non-clinical question?',
    links: resolveLinks(['meet_and_greet', 'spruce_practice', 'call_siya']),
    citations: [],
    refusalCategory: 'clinical',
    analyticsEvent: 'secure_chat_handoff',
  }
}

export function internalResponse(): GuideResponse {
  return {
    state: 'restricted',
    message: INTERNAL_MESSAGE,
    followUp: 'I can help with things like ADHD care, pricing, labs, or booking a Meet & Greet — what would be most useful?',
    links: resolveLinks(['homepage', 'health_guides', 'meet_and_greet']),
    citations: [],
    refusalCategory: 'internal',
    analyticsEvent: 'bot_refusal_category',
  }
}

export function clinicalResponse(extraLinks: string[] = ['adhd_care', 'adhd_screening', 'meet_and_greet']): GuideResponse {
  return {
    state: 'restricted',
    message: CLINICAL_MESSAGE,
    followUp: 'Want ADHD care info, the free screening, or a Meet & Greet to talk through next steps?',
    links: resolveLinks(extraLinks),
    citations: [],
    refusalCategory: 'clinical',
    analyticsEvent: 'bot_refusal_category',
  }
}

export function notFoundResponse(extraLinks: string[] = ['health_guides', 'meet_and_greet', 'call_siya']): GuideResponse {
  return {
    state: 'not_found',
    message: `${NOT_FOUND_MESSAGE} You’re welcome to browse Health Guides, book a free Meet & Greet, or reach our team by call/text.`,
    followUp: 'Want ADHD care, pricing, labs — or to talk with a human (call, text, email, or Spruce)?',
    links: resolveLinks(extraLinks),
    citations: [],
    refusalCategory: 'unsupported',
    analyticsEvent: 'bot_refusal_category',
  }
}

/** Visitor wants a person — not more bot navigation */
export function humanHandoffResponse(): GuideResponse {
  return {
    state: 'verified',
    message:
      'Absolutely — you can reach a human on the Siya team by calling or texting (215) 445-1244, emailing care@siya.health, booking a free Meet & Greet, or messaging through Spruce for a more private clinical conversation.',
    followUp:
      'Pick call, text, email, Meet & Greet, or Spruce — whichever is easiest. This chat can’t hand you off live yet, but those paths go to people.',
    links: resolveLinks(['call_siya', 'text_siya', 'email_siya', 'meet_and_greet', 'spruce_practice'], 5),
    citations: [],
    refusalCategory: 'none',
    analyticsEvent: 'booking_handoff',
  }
}
