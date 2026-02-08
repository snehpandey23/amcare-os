/**
 * Message types and dialogue state for the adaptive patient chat simulator.
 */

import type { Persona } from './personas.js'

export interface DialogueState {
  sessionId: string
  personaId: string
  persona: Persona
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  conversationTurns: number
  startTime: number
  assessmentData?: AssessmentData
}

export interface AssessmentData {
  maResponseTimes: number[]
  maTypingSpeeds: number[]
  responseLatencies: number[]
}

/** Client -> Server */
export interface MAMessagePayload {
  type: 'ma_message'
  content: string
  sessionId: string
  personaId: string
  typingStartedAt?: number
  typingCompletedAt?: number
}

/** Server -> Client */
export interface PatientTokenPayload {
  type: 'patient_token'
  token: string
  elapsedMs?: number
  isComplete: false
}

export interface PatientCompletePayload {
  type: 'patient_complete'
  fullResponse: string
  totalTimeMs: number
  responseLatencyMs?: number
  firstTokenTime?: number
  isComplete: true
}
