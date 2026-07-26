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

export interface GuideResponse {
  state: GuideState
  message: string
  followUp?: string
  links: GuideLink[]
  citations: GuideLink[]
  refusalCategory: RefusalCategory
  analyticsEvent?: AnalyticsEventName
}
