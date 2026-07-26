import { SiyaGuide } from '@/components/SiyaGuide'

/** Staging/demo host — widget only (no developer chrome). */
export default function Page() {
  return (
    <main className="embed-host">
      <SiyaGuide defaultOpen />
    </main>
  )
}