'use client'

import { useEffect, useRef, useState } from 'react'
import { QUICK_ACTIONS } from '@/lib/link-registry'
import { OPENING_MESSAGE } from '@/lib/templates'
import type { GuideLink, GuideResponse } from '@/lib/types'

function CallbackInlineForm({
  disabled,
  onSubmit,
}: {
  disabled: boolean
  onSubmit: (form: { name: string; email: string; phone: string; message: string }) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')

  return (
    <form
      className="sg-callback-form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim(), message: message.trim() })
      }}
    >
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} disabled={disabled} />
      </label>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={254}
          disabled={disabled}
        />
      </label>
      <label>
        Phone <span className="sg-callback-optional">(optional)</span>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} disabled={disabled} />
      </label>
      <label>
        How can we help?
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="General question — no clinical details, please."
          disabled={disabled}
        />
      </label>
      <button type="submit" disabled={disabled || !name.trim() || !email.trim()}>
        Request callback
      </button>
    </form>
  )
}

type ChatItem =
  | { id: string; role: 'user'; text: string }
  | {
      id: string
      role: 'assistant'
      text: string
      followUp?: string
      links?: GuideLink[]
      state?: string
      showCallbackForm?: boolean
      callbackSubmitted?: boolean
    }

async function track(name: string, props: Record<string, string> = {}) {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, ...props }),
    })
  } catch {
    // ignore analytics failures
  }
}

export function SiyaGuide({
  defaultOpen = false,
  embed = false,
}: {
  defaultOpen?: boolean
  embed?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<ChatItem[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const openedRef = useRef(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [items, open, busy])

  useEffect(() => {
    if (open && !openedRef.current) {
      openedRef.current = true
      void track('chat_opened')
    }
  }, [open])

  useEffect(() => {
    if (!embed || typeof window === 'undefined') return
    document.documentElement.classList.add('sg-embed')
    document.body.classList.add('sg-embed')
  }, [embed])

  useEffect(() => {
    if (!embed || typeof window === 'undefined') return
    const payload = {
      source: 'siya-concierge',
      open,
      width: open ? Math.min(440, window.innerWidth) : Math.min(360, window.innerWidth),
      height: open ? Math.min(720, window.innerHeight - 12) : 96,
    }
    window.parent?.postMessage(payload, '*')
  }, [embed, open])

  async function submit(text: string, actionId?: string) {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    setError(null)
    setInput('')
    setBusy(true)

    const userId = `u_${Date.now()}`
    setItems((prev) => [...prev, { id: userId, role: 'user', text: trimmed }])

    if (actionId) void track('quick_action_clicked', { actionId })

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })
      const data = (await res.json()) as GuideResponse & { error?: string; showCallbackForm?: boolean }
      if (!res.ok) {
        throw new Error(data.error || 'Request failed')
      }
      if (data.showCallbackForm) void track('callback_form_shown')
      setItems((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text: data.message,
          followUp: data.followUp,
          links: data.links,
          state: data.state,
          showCallbackForm: data.showCallbackForm,
        },
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  function onLinkClick(link: GuideLink) {
    if (link.id === 'secure_chat' || link.id === 'spruce_practice')
      void track('secure_chat_handoff', { linkId: link.id })
    else if (link.id === 'meet_and_greet' || link.id === 'book_appointment')
      void track('booking_handoff', { linkId: link.id })
    else if (link.id === 'adhd_screening') void track('screening_link_clicked', { linkId: link.id })
    else void track('service_link_clicked', { linkId: link.id })
  }

  async function submitCallback(
    itemId: string,
    form: { name: string; email: string; phone: string; message: string },
  ) {
    setError(null)
    setBusy(true)
    try {
      const res = await fetch('/api/callback-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          consent: true,
          sourceUrl: typeof window !== 'undefined' ? window.parent?.location?.href || document.referrer || '' : '',
        }),
      })
      const data = (await res.json()) as { error?: string; ok?: boolean }
      if (!res.ok) throw new Error(data.error || 'Unable to submit request.')
      void track('callback_form_submit')
      setItems((prev) =>
        prev.map((m) =>
          m.id === itemId && m.role === 'assistant'
            ? { ...m, showCallbackForm: false, callbackSubmitted: true }
            : m,
        ),
      )
      setItems((prev) => [
        ...prev,
        {
          id: `a_cb_${Date.now()}`,
          role: 'assistant',
          text: 'Thanks — our team will follow up by email. For urgent needs, call (215) 445-1244.',
        },
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  const showQuick = items.length === 0

  return (
    <div className={`sg-root${embed ? ' sg-root--embed' : ''}`}>
      {open && (
        <div className="sg-panel" role="dialog" aria-label="Siya AI Concierge">
          <div className="sg-header">
            <div className="sg-header-title">
              <strong>Siya AI Concierge</strong>
              <span className="sg-online">Here to help you find the right next step</span>
            </div>
            <button
              type="button"
              className="sg-close"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="sg-messages">
            <div className="sg-bubble assistant sg-welcome">
              <div className="sg-text">{OPENING_MESSAGE}</div>
            </div>
            {items.map((m) => (
              <div key={m.id} className={`sg-bubble ${m.role}`}>
                <div className="sg-text">{m.text}</div>
                {m.role === 'assistant' && m.followUp && (
                  <p className="sg-followup">{m.followUp}</p>
                )}
                {m.role === 'assistant' && m.links && m.links.length > 0 && (
                  <div className="sg-links">
                    {m.links.map((link) => {
                      const isDirect = link.url.startsWith('tel:') || link.url.startsWith('sms:') || link.url.startsWith('mailto:')
                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          {...(isDirect ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                          className="sg-link"
                          onClick={() => onLinkClick(link)}
                        >
                          {link.label}
                        </a>
                      )
                    })}
                  </div>
                )}
                {m.role === 'assistant' && m.showCallbackForm && !m.callbackSubmitted && (
                  <CallbackInlineForm
                    disabled={busy}
                    onSubmit={(form) => void submitCallback(m.id, form)}
                  />
                )}
              </div>
            ))}
            {busy && (
              <div className="sg-bubble assistant sg-typing" aria-live="polite">
                <span />
                <span />
                <span />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {showQuick && (
            <div className="sg-chips">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className="sg-chip"
                  disabled={busy}
                  onClick={() => submit(action.prompt, action.id)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="sg-error" role="alert">
              {error}
            </div>
          )}

          <form
            className="sg-composer"
            onSubmit={(e) => {
              e.preventDefault()
              void submit(input)
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 500))}
              placeholder="Ask about care, pricing, or next steps…"
              aria-label="Message"
              disabled={busy}
              maxLength={500}
            />
            <button type="submit" disabled={busy || !input.trim()}>
              Send
            </button>
          </form>
          <div className="sg-footer">Not a clinician · Please don’t share sensitive personal details · Emergencies: 911 / 988</div>
        </div>
      )}

      <button
        type="button"
        className={`sg-launcher${open ? ' sg-launcher--open' : ''}`}
        aria-label={open ? 'Close Siya AI Concierge' : 'Talk to our Siya AI Concierge'}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <span className="sg-launcher-x" aria-hidden="true">
            ×
          </span>
        ) : (
          <>
            <span className="sg-launcher-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v7A2.5 2.5 0 0 1 17.5 17H9l-3.6 2.7A.75.75 0 0 1 4 19.1V7.5Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="sg-launcher-copy">
              <span className="sg-launcher-kicker">Need help?</span>
              <span className="sg-launcher-title">Talk to our Siya AI Concierge</span>
            </span>
          </>
        )}
      </button>
    </div>
  )
}