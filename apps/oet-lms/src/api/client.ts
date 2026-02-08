/**
 * API client for OET LMS – auth and sessions.
 * In production (Amplify etc.) set VITE_API_ORIGIN to your submissions API URL.
 * Locally, Vite proxies /api to the submissions backend.
 */
const API = (import.meta.env.VITE_API_ORIGIN as string) || '/api'

function getToken(): string | null {
  return localStorage.getItem('oet_lms_token')
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export interface User {
  id: string
  email: string
  name: string | null
  role: string
}

export interface SessionRecord {
  id: string
  personaId: string
  personaName: string
  timestamp: number
  messageCount: number
  empathyScore: number
  grammarScore: number
  avgWpm: number
  calgaryScore?: number | null
  calgaryMax?: number | null
  createdAt?: string
}

export interface AdminSessionRecord extends SessionRecord {
  userId: string
  userEmail: string
  userName: string | null
}

export async function register(email: string, password: string, name?: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password, name: name || null }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Registration failed')
  return data
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Login failed')
  return data
}

export async function fetchMe(): Promise<User | null> {
  const token = getToken()
  if (!token) return null
  const res = await fetch(`${API}/auth/me`, { headers: getHeaders() })
  if (res.status === 401) return null
  if (!res.ok) return null
  return res.json()
}

export async function fetchMySessions(): Promise<SessionRecord[]> {
  const res = await fetch(`${API}/sessions`, { headers: getHeaders() })
  if (res.status === 401) return []
  if (!res.ok) return []
  return res.json()
}

export interface SaveSessionBody {
  personaId: string
  personaName: string
  timestamp: number
  messageCount: number
  empathyScore: number
  grammarScore: number
  avgWpm: number
  calgaryScore?: number
  calgaryMax?: number
  transcript?: unknown
}

export async function saveSession(body: SaveSessionBody): Promise<void> {
  const res = await fetch(`${API}/sessions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })
  if (res.status === 401) return
  if (!res.ok) throw new Error('Failed to save session')
}

export async function fetchAdminSessions(limit?: number): Promise<AdminSessionRecord[]> {
  const url = limit ? `${API}/admin/sessions?limit=${limit}` : `${API}/admin/sessions`
  const res = await fetch(url, { headers: getHeaders() })
  if (res.status === 401 || res.status === 403) return []
  if (!res.ok) return []
  return res.json()
}

export async function fetchAdminUsers(): Promise<User[]> {
  const res = await fetch(`${API}/admin/users`, { headers: getHeaders() })
  if (res.status === 401 || res.status === 403) return []
  if (!res.ok) return []
  return res.json()
}

export function setToken(token: string): void {
  localStorage.setItem('oet_lms_token', token)
}

export function clearToken(): void {
  localStorage.removeItem('oet_lms_token')
}
