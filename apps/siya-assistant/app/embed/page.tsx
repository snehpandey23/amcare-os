import { SiyaGuide } from '@/components/SiyaGuide'

/** Transparent embed surface for siya.health iframe loader. */
export default function EmbedPage() {
  return (
    <main className="embed-host embed-host--transparent">
      <SiyaGuide defaultOpen={false} embed />
    </main>
  )
}