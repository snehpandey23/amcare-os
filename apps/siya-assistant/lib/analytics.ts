import type { AnalyticsEventName } from './types'

/**
 * Minimal event analytics — never store free-text chat content.
 */
export function emitGuideEvent(
  name: AnalyticsEventName,
  props: Record<string, string | number | boolean | undefined> = {},
) {
  const payload = {
    name,
    ts: Date.now(),
    ...props,
  }
  // Server-side structured log only (no transcript).
  console.info('[siya-guide-analytics]', JSON.stringify(payload))
}
