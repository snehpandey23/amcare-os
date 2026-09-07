/**
 * Email helpers — prefer Resend (same as staff portal), fall back to SMTP/nodemailer.
 */

export type SendEmailResult = {
  sent: boolean
  via: 'resend' | 'smtp' | 'none'
  error?: string
  id?: string
}

export async function sendEmail(opts: {
  to: string
  subject: string
  text: string
  from?: string
}): Promise<SendEmailResult> {
  const to = opts.to.trim().toLowerCase()
  if (!to.includes('@')) {
    return { sent: false, via: 'none', error: 'invalid_recipient' }
  }

  const resendKey = process.env.RESEND_API_KEY?.trim()
  if (resendKey) {
    const from =
      opts.from?.trim() ||
      process.env.SIYA_INVITE_FROM?.trim() ||
      process.env.SIYA_ESCALATION_FROM?.trim() ||
      process.env.SMTP_FROM?.trim() ||
      'Siya Health Training <onboarding@resend.dev>'
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject: opts.subject,
          text: opts.text,
        }),
      })
      const bodyText = await res.text()
      if (!res.ok) {
        console.error('[oet-lms-submissions] Resend failed', res.status, bodyText.slice(0, 200))
        return { sent: false, via: 'resend', error: `resend_${res.status}` }
      }
      let id: string | undefined
      try {
        id = (JSON.parse(bodyText) as { id?: string }).id
      } catch {
        /* ignore */
      }
      return { sent: true, via: 'resend', id }
    } catch (err) {
      console.error('[oet-lms-submissions] Resend error', err)
      return { sent: false, via: 'resend', error: 'resend_network' }
    }
  }

  const host = process.env.SMTP_HOST?.trim()
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()
  if (host && user && pass) {
    try {
      const nodemailer = await import('nodemailer')
      const transporter = nodemailer.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass },
      })
      await transporter.sendMail({
        from: opts.from || process.env.SMTP_FROM || user,
        to,
        subject: opts.subject,
        text: opts.text,
      })
      return { sent: true, via: 'smtp' }
    } catch (err) {
      console.error('[oet-lms-submissions] SMTP error', err)
      return { sent: false, via: 'smtp', error: 'smtp_failed' }
    }
  }

  return {
    sent: false,
    via: 'none',
    error: 'No RESEND_API_KEY or SMTP configured on oet-lms-submissions',
  }
}
