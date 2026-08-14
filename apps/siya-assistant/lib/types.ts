export type GuideState =
  | 'verified'
  | 'ambiguous'
  | 'not_found'
  | 'restricted'
  | 'emergency'
  | 'privacy'

export type RefusalCategory =
  | 'emergency'
  | 'phi'
  | 'internal'
  | 'clinical'
  | 'injection'
  | 'unsupported'
  | 'none'

export type AnalyticsEventName =
  | 'chat_opened'
  | 'service_link_clicked'
  | 'screening_link_clicked'
  | 'secure_chat_handoff'
  | 'booking_handoff'
  | 'bot_refusal_category'
  | 'quick_action_clicked'
  | 'entity_resolved'
  | 'entity_fallback'

export interface LinkRecord {
  id: string
  label: string
  url: string
  kind?: 'service' | 'screening' | 'booking' | 'secure' | 'education' | 'contact'
}

export interface KnowledgeChunk {
  id: string
  title: string
  url: string
  path: string
  summary: string
  topics: string[]
  keywords: string[]
}

export interface RetrievedChunk extends KnowledgeChunk {
  score: number
}

export interface GuideLink {
  id: string
  label: string
  url: string
}

export type SafetyClass = 'general_information' | 'navigation' | 'restricted'

export interface GuideResponse {
  state: GuideState
  message: string
  followUp?: string
  links: GuideLink[]
  citations: GuideLink[]
  refusalCategory: RefusalCategory
  analyticsEvent?: AnalyticsEventName
  /** Public Knowledge API fields when an entity resolved (never include PHI). */
  entity?: string
  intent?: string
  care_pathway?: string
  safety_class?: SafetyClass
  primary_cta_id?: string
}
