import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Siya AI Concierge',
  description:
    'Siya AI Concierge helps visitors explore Siya Health public services, screenings, guides, and appointment options. Not a clinician.',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}